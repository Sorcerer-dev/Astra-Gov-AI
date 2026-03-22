import os
import shutil
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv

load_dotenv()

DATA_PATH = "data"
CHROMA_PATH = "chroma_db"

def main():
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        print("Error: GOOGLE_API_KEY not found in environment. Please set it in .env first.")
        return

    print("Initializing Google Generative AI Embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

    print(f"Loading documents from {DATA_PATH}...")
    documents = []
    
    if not os.path.exists(DATA_PATH):
        os.makedirs(DATA_PATH)
        print(f"Created {DATA_PATH} directory. Please add some .txt or .pdf files.")
        return

    # Load Text files
    txt_loader = DirectoryLoader(DATA_PATH, glob="*.txt", loader_cls=TextLoader)
    documents.extend(txt_loader.load())
    
    # Load PDF files
    pdf_loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
    try:
        documents.extend(pdf_loader.load())
    except Exception as e:
        print(f"Warning: PDF loading issue: {e}")

    if not documents:
        print("No documents found. Exiting.")
        return

    print(f"Loaded {len(documents)} documents.")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=50,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split documents into {len(chunks)} chunks.")

    if os.path.exists(CHROMA_PATH):
        print("Clearing existing Chroma database for cloud migration...")
        shutil.rmtree(CHROMA_PATH)

    print("Saving chunks to Chroma vector database (Cloud Native)...")
    db = Chroma.from_documents(
        chunks, 
        embeddings, 
        persist_directory=CHROMA_PATH
    )
    print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}.")
    print("Cloud RAG Ingestion Complete!")

if __name__ == "__main__":
    main()
