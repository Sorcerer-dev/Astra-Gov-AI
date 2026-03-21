# setup_offline.py
import sys
import subprocess

def install_requirements():
    print("Installing requirements for offline execution...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def download_models():
    print("\nDownloading translation models (this will take a few minutes if downloading for the first time)...")
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        
        # We use the 600M distilled version for a good balance of speed and quality (~2.5GB download)
        model_name = "facebook/nllb-200-distilled-600M"
        print(f"Loading {model_name}...")
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        print("✅ Translation models downloaded successfully!")
    except Exception as e:
        print(f"❌ Error downloading translation models: {e}")
        sys.exit(1)

def ollama_instructions():
    print("\n" + "="*50)
    print("🤖 OFFLINE LLM SETUP (OLLAMA)")
    print("="*50)
    print("To run the RAG answering engine completely offline, you MUST install Ollama.")
    print("\n1. Go to: https://ollama.com/download and install Ollama for your OS.")
    print("2. Open a new terminal and run: ollama run llama3")
    print("   (This will download the Llama 3 model. It may take a while depending on your internet connection).")
    print("\nOnce Ollama is running and the model is downloaded, your backend will work 100% offline!")
    print("="*50 + "\n")

if __name__ == "__main__":
    install_requirements()
    download_models()
    ollama_instructions()
