import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import chromadb
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check for API key
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY environment variable not found. Please set it in backend/.env")

# Initialize ChromaDB Client in HttpClient mode (to be queryable by the main FastAPI server later)
# Note: For this ingestion script to run, you don't *need* the server running, it will just create the local db files.
# But using PersistentClient ensures data is written to disk at the specified path.
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

print(f"Initializing ChromaDB at: {DB_DIR}")
chroma_client = chromadb.PersistentClient(path=DB_DIR)

# Ensure collection exists
collection_name = "astra_gov_knowledge"
try:
    # Get or create
    collection = chroma_client.get_or_create_collection(name=collection_name)
    print(f"Connected to ChromaDB collection: {collection_name}")
except Exception as e:
    print(f"Error connecting to ChromaDB: {e}")
    exit(1)

# Initialize Embeddings Models
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

# Text Splitter settings requested by Plan (1000 chunk, 100 overlap)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    length_function=len
)

def ingest_pdf(file_path: str, category: str):
    print(f"\nProcessing: {file_path}")
    if not os.path.exists(file_path):
        print(f"Warning: File not found: {file_path}")
        return

    loader = PyPDFLoader(file_path)
    pages = loader.load()
    print(f"Extracted {len(pages)} pages.")

    # Split into chunks
    chunks = text_splitter.split_documents(pages)
    print(f"Created {len(chunks)} text chunks (size=1000, overlap=100).")

    # Prepare for Chroma ingestion
    documents = []
    metadatas = []
    ids = []

    file_name = os.path.basename(file_path)

    for i, chunk in enumerate(chunks):
        documents.append(chunk.page_content)
        
        # Merge existing metadata (like page number from PyPDFLoader) with custom metadata
        meta = chunk.metadata.copy()
        meta["source"] = file_name
        meta["category"] = category
        metadatas.append(meta)

        # Create unique ID for the chunk
        doc_id = f"{file_name}_chunk_{i}"
        ids.append(doc_id)

    # Embed and Upsert to ChromaDB in batches (Chroma handles the embedding call internally if we pass the embedding function, 
    # but since we are using Langchain embeddings with native Chromadb client, we must embed manually or translate.)
    
    print("Generating embeddings via Google Generative AI...")
    embedded_docs = embeddings.embed_documents(documents)

    print(f"Upserting {len(chunks)} vectors into ChromaDB '{collection_name}'...")
    collection.upsert(
        documents=documents,
        embeddings=embedded_docs,
        metadatas=metadatas,
        ids=ids
    )
    print(f"Successfully ingested {file_name}!")

if __name__ == "__main__":
    print("=== Astra Gov AI Knowledge Base Ingestion ===")
    
    # We will look for two explicit test files based on the specification
    # 1. Scheme Guidelines
    # 2. Business Licensing
    
    scheme_doc = os.path.join(DATA_DIR, "PMEGP_Guidelines.pdf")
    business_doc = os.path.join(DATA_DIR, "Food_Safety_FSSAI.pdf")
    
    # If the directories don't have the files, we'll create some dummy raw text files as PDFs just so the script doesn't crash empty.
    # In a real scenario, the user places the real PDFs here.
    
    # For now, we will just iterate over whatever is in the data dir
    if os.path.exists(DATA_DIR):
        files = os.listdir(DATA_DIR)
        if len(files) == 0:
            print(f"No PDF files found in {DATA_DIR}. Please add some official documents to ingest.")
        for f in files:
            if f.endswith(".pdf"):
                # Simple categorization logic
                cat = "BUSINESS" if "fssai" in f.lower() or "business" in f.lower() else "SCHEME"
                ingest_pdf(os.path.join(DATA_DIR, f), cat)
    else:
        print(f"Data directory not found: {DATA_DIR}")
        
    print("\nIngestion pipeline complete.")
