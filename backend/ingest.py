import os
import shutil
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

DATA_PATH = "data"
CHROMA_PATH = "chroma_db"

def main():
    print("Initializing embedding model (SentenceTransformers)...")
    # Using a fast, free local embedding model
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print(f"Loading documents from {DATA_PATH}...")
    # Load all txt and pdf files from the 'data' directory
    documents = []
    
    # Check if data directory exists
    if not os.path.exists(DATA_PATH):
        os.makedirs(DATA_PATH)
        print(f"Created {DATA_PATH} directory. Please add some .txt or .pdf files and re-run.")
        return

    # Load Text files
    txt_loader = DirectoryLoader(DATA_PATH, glob="*.txt", loader_cls=TextLoader)
    documents.extend(txt_loader.load())
    
    # Load PDF files (optional for future use)
    pdf_loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
    try:
        documents.extend(pdf_loader.load())
    except Exception as e:
        print(f"Warning: PDF loading encountered an issue (perhaps no PDFs or pypdf missing): {e}")

    if not documents:
        print("No documents found to process. Exiting.")
        return

    print(f"Loaded {len(documents)} documents.")
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split documents into {len(chunks)} chunks.")

    # Clear existing database if it exists to avoid duplication during tests
    if os.path.exists(CHROMA_PATH):
        print("Clearing existing Chroma database...")
        shutil.rmtree(CHROMA_PATH)

    # Save to Chroma
    print("Saving chunks to Chroma vector database...")
    db = Chroma.from_documents(
        chunks, 
        embeddings, 
        persist_directory=CHROMA_PATH
    )
    db.persist()
    print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}.")
    print("RAG Ingestion Complete!")

if __name__ == "__main__":
    main()
