import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from contextlib import asynccontextmanager

load_dotenv()

# Global variables for models
embeddings = ...
retriever = None
llm = None
nllb_tokenizer = None
nllb_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global embeddings, retriever, llm, nllb_tokenizer, nllb_model
    
    DATA_PATH = "data"
    CHROMA_PATH = "chroma_db"

    print("Initializing embedding model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Connecting to ChromaDB...")
    if os.path.exists(CHROMA_PATH):
        vectorstore = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    else:
        print(f"Warning: {CHROMA_PATH} not found. RAG will not work until ingest.py is run.")
        retriever = None

    print("Initializing Local Ollama LLM...")
    llm = ChatOllama(model="llama3", temperature=0)

    print("Initializing Local NLLB Translation Model...")
    NLLB_MODEL_NAME = "facebook/nllb-200-distilled-600M"
    try:
        nllb_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME)
        nllb_model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL_NAME)
    except Exception as e:
        print(f"Warning: Could not load NLLB model. Please run setup_offline.py first. Error: {e}")
        nllb_tokenizer = None
        nllb_model = None
        
    yield
    
    # Optional cleanup on shutdown
    embeddings = None
    retriever = None
    llm = None
    nllb_tokenizer = None
    nllb_model = None

app = FastAPI(title="Astra Gov AI Backend", lifespan=lifespan)

# Allow CORS for local network testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your specific frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = (
    "You are an assistant for the Astra Gov AI question-answering tasks. "
    "Use the following pieces of retrieved context to answer the question. "
    "If the answer is not contained in the context, you MUST say 'I'm sorry, I don't have information about that in my database.' "
    "Do NOT use any outside knowledge to answer the question. Keep your answers clear, professional, and directly address the user's need based solely on the context.\n\n"
    "Context:\n{context}"
)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str

class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

class TranslateResponse(BaseModel):
    translated_text: str

class VoiceChatRequest(BaseModel):
    query: str  # Text in user's local language
    language: str  # e.g. "Hindi", "Tamil"

class VoiceChatResponse(BaseModel):
    answer: str  # Answer in user's language
    original_answer: str  # Answer in English
    translated_query: str  # The English translation of the user's query

SUPPORTED_LANGUAGES = {
    "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
    "kn": "Kannada", "mr": "Marathi", "bn": "Bengali",
    "en": "English"
}

NLLB_LANGS = {
    "English": "eng_Latn",
    "Hindi": "hin_Deva",
    "Tamil": "tam_Taml",
    "Telugu": "tel_Telu",
    "Kannada": "kan_Knda",
    "Marathi": "mar_Deva",
    "Bengali": "ben_Beng"
}

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Use local NLLB model to translate text between languages."""
    if source_lang.lower() == target_lang.lower():
        return text
        
    if not nllb_model or not nllb_tokenizer:
        print("Warning: NLLB not loaded. Skipping translation.")
        return text
        
    src_code = NLLB_LANGS.get(source_lang, "eng_Latn")
    tgt_code = NLLB_LANGS.get(target_lang, "eng_Latn")
    
    nllb_tokenizer.src_lang = src_code
    inputs = nllb_tokenizer(text, return_tensors="pt")
    
    # Generate translation
    translated_tokens = nllb_model.generate(
        **inputs, 
        forced_bos_token_id=nllb_tokenizer.convert_tokens_to_ids(tgt_code), 
        max_length=200
    )
    
    return nllb_tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]


@app.get("/")
def read_root():
    return {"status": "Astra Gov AI API is running"}

@app.get("/api/languages")
def get_languages():
    """Return the list of supported languages."""
    return {"languages": SUPPORTED_LANGUAGES}

@app.post("/api/translate", response_model=TranslateResponse)
def translate_endpoint(request: TranslateRequest):
    """Translate text between any two supported languages."""
    result = translate_text(request.text, request.source_lang, request.target_lang)
    return TranslateResponse(translated_text=result)

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        if not retriever:
            return ChatResponse(answer="RAG Database not initialized. Please run ingest.py first.")
        
        # 1. Retrieve relevant documents
        docs = retriever.invoke(request.query)
        context_text = "\n\n".join([doc.page_content for doc in docs])
        
        # 2. Construct the prompt
        system_message = SYSTEM_PROMPT.format(context=context_text)
        
        # 3. Call the LLM
        response = llm.invoke([
            SystemMessage(content=system_message),
            HumanMessage(content=request.query)
        ])
        
        return ChatResponse(answer=response.content)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise
    
    # 1. Retrieve relevant documents
    docs = retriever.invoke(request.query)
    context_text = "\n\n".join([doc.page_content for doc in docs])
    
    # 2. Construct the prompt
    system_message = SYSTEM_PROMPT.format(context=context_text)
    
    # 3. Call the LLM
    response = llm.invoke([
        SystemMessage(content=system_message),
        HumanMessage(content=request.query)
    ])
    
    return ChatResponse(answer=response.content)

@app.post("/api/voice-chat", response_model=VoiceChatResponse)
def voice_chat_endpoint(request: VoiceChatRequest):
    """Full voice pipeline: translate query → RAG → translate answer back."""
    lang_name = request.language  # e.g. "Hindi"
    
    try:
        # Step 1: Translate user's query to English
        if lang_name.lower() != "english":
            english_query = translate_text(request.query, lang_name, "English")
        else:
            english_query = request.query
        
        # Step 2: Run RAG on the English query
        if not retriever:
            english_answer = "RAG Database not initialized. Please run ingest.py first."
        else:
            docs = retriever.invoke(english_query)
            context_text = "\n\n".join([doc.page_content for doc in docs])
            system_message = SYSTEM_PROMPT.format(context=context_text)
            response = llm.invoke([
                SystemMessage(content=system_message),
                HumanMessage(content=english_query)
            ])
            english_answer = response.content
        
        # Step 3: Translate answer back to user's language
        if lang_name.lower() != "english":
            local_answer = translate_text(english_answer, "English", lang_name)
        else:
            local_answer = english_answer
        
        return VoiceChatResponse(
            answer=local_answer,
            original_answer=english_answer,
            translated_query=english_query
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise
    
    # Step 2: Run RAG on the English query
    if not retriever:
        english_answer = "RAG Database not initialized. Please run ingest.py first."
    else:
        docs = retriever.invoke(english_query)
        context_text = "\n\n".join([doc.page_content for doc in docs])
        system_message = SYSTEM_PROMPT.format(context=context_text)
        response = llm.invoke([
            SystemMessage(content=system_message),
            HumanMessage(content=english_query)
        ])
        english_answer = response.content
    
    # Step 3: Translate answer back to user's language
    if lang_name.lower() != "english":
        local_answer = translate_text(english_answer, "English", lang_name)
    else:
        local_answer = english_answer
    
    return VoiceChatResponse(
        answer=local_answer,
        original_answer=english_answer,
        translated_query=english_query
    )

if __name__ == "__main__":
    import uvicorn
    # RUNNING ON 0.0.0.0 EXPOSES THE API TO YOUR LOCAL NETWORK
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
