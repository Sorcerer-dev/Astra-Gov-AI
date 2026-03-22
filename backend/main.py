import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage, SystemMessage
from contextlib import asynccontextmanager

load_dotenv()

# Global variables for models
embeddings = None
retriever = None
llm = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global embeddings, retriever, llm
    
    CHROMA_PATH = "chroma_db"
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

    if not GOOGLE_API_KEY:
        print("CRITICAL WARNING: GOOGLE_API_KEY not found in environment variables.")

    print("Initializing Google Generative AI Embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

    print("Connecting to ChromaDB...")
    if os.path.exists(CHROMA_PATH):
        vectorstore = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    else:
        print(f"Warning: {CHROMA_PATH} not found. RAG will not work until documents are ingested.")
        retriever = None

    print("Initializing Google Gemini 1.5 Flash...")
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
        
    yield
    
    # Cleanup
    embeddings = None
    retriever = None
    llm = None

app = FastAPI(title="Astra Gov AI Cloud Backend", lifespan=lifespan)

# Allow CORS for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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
    query: str  
    language: str  

class VoiceChatResponse(BaseModel):
    answer: str  
    original_answer: str  
    translated_query: str  

SUPPORTED_LANGUAGES = {
    "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
    "kn": "Kannada", "mr": "Marathi", "bn": "Bengali",
    "en": "English"
}

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Use Gemini for translation."""
    if source_lang.lower() == target_lang.lower() or not text:
        return text
    
    if not llm:
        return text
        
    prompt = (
        f"You are a professional translator. Translate the following text from {source_lang} to {target_lang}. "
        "Return ONLY the translated text without any extra notes or explanation.\n\n"
        f"Text: {text}"
    )
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except Exception as e:
        print(f"Translation Error: {e}")
        return text

@app.get("/")
def read_root():
    return {"status": "Astra Gov AI Cloud API is running"}

@app.get("/api/languages")
def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}

@app.post("/api/translate", response_model=TranslateResponse)
def translate_endpoint(request: TranslateRequest):
    result = translate_text(request.text, request.source_lang, request.target_lang)
    return TranslateResponse(translated_text=result)

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        if not retriever:
            return ChatResponse(answer="RAG Database not initialized.")
        
        docs = retriever.invoke(request.query)
        context_text = "\n\n".join([doc.page_content for doc in docs])
        system_message = SYSTEM_PROMPT.format(context=context_text)
        
        response = llm.invoke([
            SystemMessage(content=system_message),
            HumanMessage(content=request.query)
        ])
        
        return ChatResponse(answer=response.content)
    except Exception as e:
        print(f"Chat Error: {e}")
        return ChatResponse(answer="I'm sorry, I'm having trouble connecting to my brain right now.")

@app.post("/api/voice-chat", response_model=VoiceChatResponse)
def voice_chat_endpoint(request: VoiceChatRequest):
    """Full voice pipeline with detailed diagnostics."""
    lang_name = request.language 
    
    try:
        # Step 1: Translate query to English
        try:
            english_query = translate_text(request.query, lang_name, "English") if lang_name.lower() != "english" else request.query
        except Exception as te:
            print(f"Query Translation Error: {te}")
            english_query = request.query # fallback
        
        # Step 2: Run RAG
        if not retriever:
            english_answer = "RAG Database not initialized on the server. Please check your data/ ingestion status."
        else:
            try:
                docs = retriever.invoke(english_query)
                context_text = "\n\n".join([doc.page_content for doc in docs])
                system_message = SYSTEM_PROMPT.format(context=context_text)
                response = llm.invoke([
                    SystemMessage(content=system_message),
                    HumanMessage(content=english_query)
                ])
                english_answer = response.content
            except Exception as re:
                print(f"RAG Error: {re}")
                # Fallback to direct prompt if RAG fails
                response = llm.invoke([HumanMessage(content=english_query)])
                english_answer = response.content
        
        # Step 3: Translate answer back
        try:
            local_answer = translate_text(english_answer, "English", lang_name) if lang_name.lower() != "english" else english_answer
        except Exception as ae:
            print(f"Answer Translation Error: {ae}")
            local_answer = english_answer
        
        return VoiceChatResponse(
            answer=local_answer,
            original_answer=english_answer,
            translated_query=english_query
        )
    except Exception as e:
        error_detail = str(e)
        print(f"CRITICAL API Error: {error_detail}")
        return VoiceChatResponse(
            answer=f"Backend Error: {error_detail[:100]}...",
            original_answer="Error occurred during processing.",
            translated_query=request.query
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
