# Astra Gov AI – System Architecture

## Overview

This document describes the high-level system architecture, agentic workflow design, and data movement within the **Astra Gov AI** platform.

Astra Gov AI is designed as a **modular agentic system** that connects citizens with government services through AI-powered workflows. The architecture integrates unstructured government documents, structured user data, and real-time civic reporting.

The system uses a **Retrieval-Augmented Generation (RAG)** approach to ensure reliable and citation-backed responses.

---

# 1. System Overview

Astra Gov AI is built using a **Modular Agentic Architecture**.

Unlike traditional monolithic applications, the system consists of a central **Orchestrator ("Brain")** that coordinates multiple specialized AI agents.

Each agent handles a specific domain of responsibility.

The architecture bridges:

Unstructured Data  
Government PDFs, scheme guidelines, policy documents

Structured Data  
User profiles, activities, and complaints stored in PostgreSQL

These two data sources are combined through a **RAG pipeline**, allowing the AI to generate grounded responses.

---

# 2. Agent Architecture

The heart of the system is the **Orchestration Layer**, responsible for managing the lifecycle of every user request.

The architecture contains one central orchestrator and multiple specialized agents.

---

## A. The Orchestrator (The Router)

The Orchestrator acts as the **central routing intelligence** of the system.

### Input

Natural language queries from users.

These queries may be submitted through:

Text input  
Voice input (future extension)

Examples:

"Am I eligible for a startup subsidy?"  
"How do I start a cafe?"  
"There is a broken streetlight near my house."

---

### Task

The Orchestrator performs several functions:

Intent classification using an LLM  
Entity extraction from user input  
Routing requests to the correct agent

Entities extracted may include:

Location  
Age  
Income  
Business type  
Complaint description

---

### Output

After analyzing the query, the orchestrator produces a **routing signal**.

Example routing outputs:

Scheme Agent  
Business Agent  
Complaint Agent

Each request is delegated to the appropriate specialized agent.

---

## B. Specialized Agents

Three domain-specific agents handle different types of tasks.

---

### Scheme Agent

Responsible for interpreting government policy language.

Key functions:

Analyze scheme eligibility criteria  
Match scheme requirements with user profile data  
Provide citation-backed responses

Inputs:

User query  
Retrieved document context  
User demographic profile

Outputs:

Eligibility status  
Reasoning explanation  
Source citation

---

### Business Agent

Responsible for business setup guidance and compliance procedures.

Key functions:

Generate step-by-step procedural roadmaps  
Convert policy information into structured checklists  
Track user progress toward completing business setup tasks

Example outputs:

Business registration checklist  
Licensing steps  
Compliance procedures

---

### Complaint Agent

Responsible for civic complaint analysis and triage.

Key functions:

Natural language processing of complaint descriptions  
Department classification  
Priority score calculation

Outputs include:

Assigned department  
Priority score (1–10)  
Complaint database entry

---

# 3. Data Flow

The system follows a **Request → Reason → Respond** workflow pattern.

---

## Step 1 – Entry

A user submits a query through the **Next.js frontend interface**.

The query may be related to:

Government schemes  
Business setup  
Public complaints

---

## Step 2 – Inference

The query is sent to the **FastAPI backend**.

The Orchestrator analyzes the input and determines the user's intent.

Example classification:

SCHEME_QUERY  
BUSINESS_SETUP  
COMPLAINT_REPORT

---

## Step 3 – Context Retrieval

The appropriate agent retrieves contextual information from two sources.

### Unstructured Data

Relevant document snippets are retrieved from **ChromaDB**.

These include:

Government scheme PDFs  
Policy guidelines  
Business procedure documents

---

### Structured Data

The agent retrieves user-specific information from **Supabase PostgreSQL**.

Example profile attributes:

Age  
Income  
Occupation  
Location

---

## Step 4 – Context Augmentation

The system constructs an augmented prompt containing:

Original user query  
Retrieved PDF document snippets  
User profile data

This enriched prompt is sent to the **LLM**.

---

## Step 5 – Execution

The LLM performs one of the following actions:

Generate a response  
Create a structured checklist  
Insert a complaint record into the database

---

## Step 6 – Delivery

The backend returns a structured JSON response to the frontend.

Example response structure:

Answer text  
Document citations  
UI actions (e.g., Save Activity)  
Checklist data

The frontend renders the response in the user interface.

---

# 4. Database Design

Astra Gov AI uses a **Hybrid Storage Model**.

Different databases are used depending on the type of data being stored.

---

## A. Vector Database (ChromaDB)

The vector database stores **high-dimensional embeddings** of government documents.

### Content Stored

Government gazettes  
Scheme guidelines  
Licensing procedures  
Policy documentation

---

### Function

ChromaDB enables **semantic search**.

Instead of keyword matching, it retrieves content based on meaning and context.

Example query:

"startup funding for young entrepreneurs"

The system retrieves relevant scheme sections even if the exact keywords do not match.

---

## B. Relational Database (Supabase / PostgreSQL)

The relational database stores structured data used by the application.

---

### Profiles Table

Stores user demographic information.

Fields include:

User ID  
Age  
Income  
Occupation  
Location

This data enables personalized eligibility checks.

---

### Activities Table

Tracks the progress of user tasks and checklists.

Examples:

Business setup steps  
Scheme application progress

Fields include:

Activity ID  
User ID  
Checklist JSON  
Progress percentage

---

### Complaints Table

Stores all civic complaints submitted by users.

Fields include:

Complaint ID  
User ID (anonymized)  
Complaint description  
Department  
Priority score  
Verification count  
Status  
Timestamp

This table acts as the **source of truth for civic issues**.

---

# 5. RAG Pipeline (Reliability Layer)

To ensure reliable responses and prevent hallucinations, the system uses a **strict Retrieval-Augmented Generation pipeline**.

---

## Query Embedding

The user query is converted into a vector embedding.

This embedding represents the semantic meaning of the question.

---

## Similarity Search

The system retrieves the **top-k most relevant document chunks** from ChromaDB.

Each chunk includes metadata such as:

Source document  
Page number  
Content category

---

## Grounded Generation

The LLM receives a strict instruction prompt.

Example rule:

"Answer the user's question only using the provided context. If the answer cannot be found, respond that the information is unavailable."

This prevents fabricated answers.

---

## Citation Mapping

The metadata of retrieved documents is attached to the response.

Example citation format:

Source: Scheme Guidelines PDF  
Page: 14

This improves transparency and trust.

---

# 6. Complaint & Transparency Workflow

The complaint module is designed to ensure **automated accountability and civic transparency**.

---

## Complaint Classification

The AI analyzes the complaint description and determines the responsible department.

Examples:

Sparking transformer → Electricity Board  
Road pothole → Public Works Department  
Garbage overflow → Municipal Sanitation

---

## Priority Scoring

The system calculates a **priority score between 1 and 10**.

Factors considered:

Public safety risk  
Infrastructure impact  
Urgency keywords

Example:

"Large pothole near school entrance" → Priority 8

---

## Public Broadcast

After classification, the complaint is stored in Supabase and published to the **Locality Feed**.

Nearby citizens can see the issue immediately.

---

## Community Validation

Other users can verify the complaint.

Each verification increases the complaint's credibility.

Effects include:

Higher priority score  
Increased visibility on the government dashboard

---

## State Synchronization

The system uses **Supabase real-time listeners**.

Whenever an official updates a complaint status, the frontend receives the update instantly.

Status lifecycle:

Pending → Assigned → In Progress → Resolved

Users see status changes in real time.

---

# Conclusion

The Astra Gov AI architecture combines:

Agentic orchestration  
Retrieval-Augmented Generation  
Hybrid database storage  
Real-time civic transparency

This architecture enables scalable, reliable, and transparent interactions between citizens and government services.