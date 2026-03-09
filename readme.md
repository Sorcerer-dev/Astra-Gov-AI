# Astra Gov AI 🇮🇳

AI-powered assistant to help citizens discover government schemes, start businesses, and report civic issues with transparency.

Astra Gov AI simplifies complex government processes using **AI agents, Retrieval-Augmented Generation (RAG), and real-time complaint tracking** to guide citizens step-by-step.

---

# 🚀 Problem

Government schemes, startup support programs, and civic complaint systems are often:

- Hard to discover  
- Difficult to understand  
- Fragmented across many websites  
- Non-transparent in complaint resolution  

Many citizens, especially first-time entrepreneurs, struggle to navigate these systems.

---

# 💡 Solution

**Astra Gov AI** provides a **single conversational interface** where users can:

- Discover government schemes they are eligible for  
- Get step-by-step guidance to start a business  
- Submit civic complaints  
- Track complaint status transparently in real time  

The system uses **AI agents + government document retrieval** to ensure responses remain grounded in official information.

---

# ✨ Key Features

## 🧠 AI Intent Router

Automatically categorizes user queries into:

- **SCHEME** → Government scheme eligibility  
- **BUSINESS** → Business startup guidance  
- **COMPLAINT** → Civic issue reporting  

---

## 📚 Government RAG System

AI retrieves answers directly from:

- Government PDFs  
- Official scheme documents  
- Policy manuals  

Ensuring **accurate and grounded responses**.

---

## 🪪 Eligibility Checker

Citizens receive a clear eligibility card:

- Eligibility result  
- Reasoning  
- Official document citations  
- Required document checklist  

---

## 🏢 Business Startup Assistant

Step-by-step help for:

- Licenses  
- Registrations  
- Funding schemes  
- Compliance requirements  

---

## ⚡ Real-time Complaint Tracking

Citizens can submit complaints and see updates instantly.

Transparency is achieved through **live database subscriptions**.

---

# 🏗 System Architecture

```
User
  │
  ▼
Next.js Frontend (Chat Interface)
  │
  ▼
FastAPI Backend
  │
  ▼
AI Orchestrator Agent
  │
  ├── Scheme RAG Agent
  ├── Business Guidance Agent
  └── Complaint Processing Agent
  │
  ▼
Vector Database (ChromaDB)
  │
  ▼
Supabase Database
```

---

# 🧠 AI Agent System

## Orchestrator Agent

Determines the intent of user queries and routes them to specialized agents.

## Scheme RAG Agent

Searches government documents and generates grounded answers.

## Business Agent

Provides structured startup guidance using curated knowledge.

## Complaint Agent

Extracts complaint details and stores structured reports.

---

# 🛠 Tech Stack

## Frontend

- Next.js  
- React  
- TailwindCSS  
- Supabase Client  

## Backend

- FastAPI  
- Python  
- LangChain / LLM APIs  

## AI & Data

- ChromaDB (Vector database)  
- RAG pipeline  
- Government document embeddings  

## Database

- Supabase (PostgreSQL)

## Real-time Updates

- Supabase Realtime Subscriptions

---

# 📡 API Overview

## Process User Query

```
POST /api/v1/process
```

Handles all user chat requests and routes them to appropriate agents.

---

## Retrieve Documents

```
POST /api/v1/retrieve
```

Used internally to query the vector database for relevant document chunks.

---

## Update Activity Checklist

```
PATCH /api/v1/activity/update
```

Updates task completion for user workflows.

---

# 📊 Example AI Response

```json
{
  "intent": "SCHEME",
  "result": {
    "is_eligible": true,
    "reasoning": "User meets the age requirement of 18-35 and income is below 5L.",
    "citations": [
      {
        "source": "Startup_India_Manual.pdf",
        "page": 12
      }
    ],
    "checklist": [
      { "item": "Valid Aadhaar Card", "status": "verified" },
      { "item": "Income Certificate", "status": "pending" }
    ]
  }
}
```

---

# 🔄 Real-time Complaint Updates

The frontend subscribes to database updates so users receive **instant status notifications** when their complaint changes.

Example update event:

```
Complaint Status → IN_PROGRESS
Complaint Status → RESOLVED
```

---

# 🖥 Local Demo Setup

## Run Backend

```
uvicorn main:app --reload --port 8000
```

## Run Frontend

```
npm run dev
```

## Access Application

```
Frontend → http://localhost:3000
Backend → http://localhost:8000
```

---

# 🎯 Hackathon Demo Flow

1. User asks about government schemes  
2. AI checks eligibility using RAG  
3. System generates document checklist  
4. User reports civic issue  
5. Complaint stored in Supabase  
6. Real-time status updates shown to user  

---

# 🔮 Future Improvements

- Multilingual support (Indian languages)  
- WhatsApp chatbot integration  
- Integration with official government APIs  
- AI document verification  
- Voice interface for rural users  

---

# 👨‍💻 Built For

- Hackathons  
- Civic tech innovation  
- Digital governance solutions  
- AI-powered public services  

---

# 📜 License

MIT License

---

# ⭐ Support

If you like this project, consider giving it a **star ⭐ on GitHub**.