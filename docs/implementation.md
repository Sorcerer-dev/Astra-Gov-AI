# Astra Gov AI – Implementation Guide

## Overview

This document describes the step-by-step implementation plan for building **Astra Gov AI**, an agentic civic platform that connects citizens and government services using AI-powered workflows.

The implementation is divided into four major phases:

1. Command Center UI Development
2. Knowledge Ingestion & Database Architecture
3. Identity and Access Management
4. Agentic Logic and API Integration

Each phase builds on the previous one, starting with a high-fidelity frontend prototype and ending with a fully integrated AI-driven backend.

---

# Phase 1: Command Center UI (Frontend First)

## Goal

Build a **high-fidelity interactive prototype** with mock data to visualize the full workflow before connecting real backend services.

This phase focuses on creating both the **Citizen Dashboard** and the **Government Dashboard**.

Frontend technologies used:

- Next.js 14 (App Router)
- Tailwind CSS
- Shadcn UI components
- Lucide React icons
- Framer Motion animations

---

## 1.1 Citizen Dashboard

The citizen interface is designed to be **mobile-first and highly intuitive**, allowing users to interact with the AI through a central search interface.

### Hero Section

The hero section contains a **large centered search bar**.

Features:

- Oversized input field
- Subtle glowing border animation
- Placeholder text guiding the user

Example placeholder:

"Ask about government schemes, business setup, or report an issue..."

When the search button is pressed, the **AI Thinking Overlay** appears.

---

### Left Sidebar – My Activities

The left sidebar displays **saved activities and progress tracking**.

Components included:

Progress Bar Component  
List of Activity Cards

Example activity cards:

Startup Grant – 40%  
Restaurant Setup – 20%  
PMEGP Application – 60%

Each card contains:

- Activity name
- Progress percentage
- Small progress bar
- Option to expand checklist

---

### Right Panel – Local Feed

The right panel shows a **scrollable list of local complaints** submitted by nearby users.

Each complaint is displayed as a card.

Card elements:

Issue description  
Department responsible  
Priority tag  
Status tag  
Verify button

Example card:

Issue: Pothole near bus stop  
Department: PWD  
Priority: High  
Status: Pending  
[ Verify ]

When users click **Verify**, the verification count increases.

---

### AI Thinking Overlay

This overlay appears after the user presses **Search**.

Purpose:

Provide visual feedback while the AI processes the request.

The overlay shows animated steps such as:

Reading government documents  
Extracting eligibility criteria  
Verifying user income  
Generating response

These steps are animated using **Framer Motion**.

---

# 1.2 Government Dashboard

The government interface is designed for **desktop use** and acts as a monitoring command center.

It allows officials to track complaints and update statuses.

---

## Stats Grid

At the top of the dashboard, three key metric cards are displayed.

Cards include:

Total Critical Issues  
Community Verified Issues  
Resolved Today

These cards provide an immediate overview of the civic situation.

---

## Complaint Triage Table

Below the stats grid is a **professional data table** showing complaints.

Columns include:

Complaint ID  
Description  
Department  
Priority  
Verification Count  
Status

Priority badges are color coded:

Red – High Priority  
Orange – Medium Priority  
Green – Low Priority

The table can be sorted by priority or verification count.

---

## Action Drawer

When an official clicks on a complaint row, a **slide-out action drawer** appears.

This drawer allows officials to manage the complaint.

Components inside the drawer:

Status dropdown selector

Options include:

Pending  
Assigned  
In Progress  
Resolved

Official Notes textarea

Officials can write updates visible to the public.

Save Changes button

Updates the complaint in the database.

---

# Phase 2: Knowledge Ingestion and Database Schema

## Goal

Prepare the system's **knowledge base** and **persistent data storage**.

This includes:

- Vector database for AI knowledge retrieval
- Relational database for user and complaint data

---

# 2.1 ChromaDB Setup

ChromaDB is used as the **vector database** for Retrieval-Augmented Generation.

It stores document embeddings that allow the AI to search government documents efficiently.

---

## Document Ingestion Script

A Python ingestion script will process sample documents.

Documents include:

Government scheme guidelines  
Startup support programs  
Business licensing procedures  
Government FAQ documents

The script performs the following steps:

1. Load PDF documents
2. Split text into smaller chunks
3. Generate embeddings
4. Store chunks in ChromaDB

---

## Metadata Mapping

Each document chunk must include metadata to allow proper citation.

Example metadata:

{
  "source": "scheme_guidelines.pdf",
  "page": 4,
  "type": "eligibility"
}

This metadata allows the AI to provide **source citations** in responses.

---

# 2.2 Supabase Database Architecture

Supabase is used for:

Authentication  
PostgreSQL database  
Realtime updates

---

## Profiles Table

Stores demographic information about users.

Fields include:

user_id  
age  
income  
occupation  
location

This data allows the AI to determine eligibility for schemes.

---

## User Activities Table

Stores saved activities and progress tracking.

Fields:

activity_id  
user_id  
activity_type  
checklist_json  
progress_percentage

Example JSON structure:

{
 "tasks": [
  {"name": "GST Registration", "completed": true},
  {"name": "Fire NOC", "completed": false}
 ]
}

---

## Complaints Table

Stores all civic complaints.

Fields include:

complaint_id  
user_id (hidden for anonymity)  
description  
department  
priority_score  
status  
verification_count  
created_at

---

## Admin Setup

One admin account must be created.

Two possible approaches:

1. Insert an admin user directly into the `auth.users` table.
2. Automatically mark users with an email suffix such as:

`@gov.in`

These users will receive admin privileges.

---

# Phase 3: Identity and Access Management

## Goal

Secure the portal and personalize the experience for users.

Authentication will be handled using **Supabase Auth**.

---

# 3.1 Authentication Flow

Users can sign up or log in using:

Email  
Password

After successful login, the system determines user type.

---

## Post Login Logic

If the user is a normal citizen:

Redirect to

/dashboard

If the user is an administrator:

Redirect to

/admin/triage

---

## Profile Initialization

A database trigger will ensure that every new user automatically receives a profile entry.

Trigger behavior:

When a new user signs up → insert an empty row into the profiles table.

Example fields initialized:

age = null  
income = null  
occupation = null

This allows the user to complete their profile later.

---

# Phase 4: Agentic Logic and API Integration

## Goal

Connect the frontend UI with the AI agents and databases.

The backend will be built using **FastAPI**.

AI orchestration will use **LangGraph or LangChain**.

---

# 4.1 Step 1 – The Orchestrator API

Create a backend API endpoint.

Endpoint:

POST /api/chat

This endpoint receives the user's query.

The AI analyzes the query and determines the user’s intent.

Example output:

{
 "intent": "SCHEME",
 "query": "startup funding scheme"
}

Possible intent values:

SCHEME  
BUSINESS  
COMPLAINT  
GENERAL

The orchestrator routes the request to the appropriate agent.

---

# 4.2 Step 2 – The RAG Agent

This agent handles **scheme queries and business setup queries**.

Workflow:

1. Receive query from orchestrator
2. Search ChromaDB for relevant documents
3. Retrieve document chunks
4. Send context to Gemini LLM
5. Generate response with citations

Example response format:

Eligible for PMEGP Scheme

Source: PMEGP Guidelines PDF – Page 14

Reason:
Applicant age above 18 and income within eligibility threshold.

---

## Save Activity Integration

The response includes an optional action.

Save Activity button

When clicked:

Frontend calls Supabase upsert operation on `user_activities`.

A checklist is created for the user.

---

# 4.3 Step 3 – Complaint Agent

The complaint agent processes civic issue reports.

Workflow:

1. Extract complaint description
2. Identify responsible department
3. Generate priority score
4. Insert complaint into Supabase

Example stored record:

Description: Large pothole near school  
Department: Public Works Department  
Priority Score: 8  
Status: Pending

---

## Real-time Complaint Feed

The Local Feed UI automatically updates using Supabase realtime listeners.

Example listener:

.on('postgres_changes', ...)

Whenever a new complaint is inserted, the UI updates instantly.

This allows:

Live complaint feed  
Live verification updates  
Live status updates

---

# Final Result

After completing all phases, the system will support:

AI-powered scheme eligibility detection  
Interactive business setup roadmaps  
Community verified complaint reporting  
Real-time government response visibility

The final platform demonstrates how **agentic AI systems can improve civic governance, transparency, and accessibility**.