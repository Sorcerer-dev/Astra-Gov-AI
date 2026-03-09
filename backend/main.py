import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Astra Gov AI Backend")

# Allow CORS for local network testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your specific frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Astra Gov AI API is running"}

if __name__ == "__main__":
    # RUNNING ON 0.0.0.0 EXPOSES THE API TO YOUR LOCAL NETWORK
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
