# Astra Gov AI – Detailed Project Plan

## Tagline
Agentic Civic Operating System for Transparent Governance

---

# 1. Project Overview

Astra Gov AI is an AI-powered civic platform designed to bridge the gap between citizens and government services. The platform combines agentic AI workflows, retrieval-augmented generation (RAG), and community verification mechanisms to provide transparent and reliable civic interactions.

The system enables citizens to:
- Check eligibility for government schemes
- Receive step-by-step procedures for starting businesses
- Report public issues with transparent tracking
- Collaborate with community members to validate civic complaints

The platform also provides a government-facing dashboard that allows officials to monitor complaints, track priorities, and update resolution statuses.

The goal is to create a scalable civic AI system that improves transparency, accessibility, and accountability.

---

# 2. Core System Architecture

The system is built around a multi-agent architecture where different AI agents perform specialized tasks. A central orchestrator agent routes user queries to the appropriate subsystem.

Main Components:

1. User Interface
2. Orchestrator Agent
3. Scheme Intelligence Agent
4. Business Consultant Agent
5. Complaint Processing Agent
6. Vector Database for document retrieval
7. Relational Database for application state
8. Government Dashboard

---

# 3. Agent Architecture

## 3.1 Orchestrator Agent

The orchestrator acts as the central dispatcher for all user queries.

Responsibilities:
- Receive user queries from the search interface
- Perform intent classification
- Route requests to the correct specialized agent
- Aggregate responses and return structured results

Example query types:
- Government scheme eligibility
- Business setup procedures
- Civic complaints
- General government information

Implementation:

Natural Language Understanding (NLU) model identifies intent categories such as:
- scheme_query
- business_setup
- complaint_submission
- general_information

Technology:
- Gemini 1.5 Flash or equivalent LLM
- LangChain or LangGraph for agent orchestration

---

# 4. Feature Module 1 – Scheme & Policy Intelligence

## Purpose

This module helps citizens determine whether they are eligible for government schemes and provides citation-backed explanations.

## Core Concept

Retrieval-Augmented Generation (RAG)

Instead of relying solely on an LLM's internal knowledge, the system retrieves relevant sections from official government documents and uses them to generate answers.

---

## Workflow

1. User submits a query

Example:
"Am I eligible for PMEGP scheme to start a business?"

2. The system retrieves relevant document chunks from the vector database.

3. The user's profile is fetched from the relational database.

User profile fields include:
- Age
- Annual income
- Occupation
- Location

4. The AI compares eligibility criteria with the user profile.

5. The system returns a structured response.

---

## Example Response

Eligible for PMEGP Scheme

Source Document: PMEGP Guidelines PDF  
Page Number: 14

Reason:
Applicant age is above 18 and income is below the eligibility threshold.

---

## Save to Activities Feature

Users can save the scheme to their personal activity dashboard.

When saved:
- A checklist is created
- Application steps are stored in the database
- Users can track their progress

Example Checklist:
- Verify eligibility
- Gather required documents
- Submit online application
- Track approval status

---

# 5. Feature Module 2 – Business Procedural Consultant

## Purpose

This module generates step-by-step instructions for starting different types of businesses.

Examples:
- Cafe
- Restaurant
- Retail shop
- Technology startup
- Manufacturing unit

Many citizens are unaware of the regulatory steps required to start businesses. This module simplifies those procedures.

---

## Workflow

1. User submits a business query.

Example:
"How do I start a cafe?"

2. The system retrieves procedural guidelines from stored documents.

3. The AI converts the information into a structured checklist.

4. The checklist becomes an interactive activity list.

---

## Example Generated Checklist

Cafe Setup Roadmap

1. Register business name
2. Apply for GST registration
3. Obtain food safety license (FSSAI)
4. Obtain fire safety clearance
5. Apply for local municipality permit
6. Register for labour compliance

---

## Progress Tracking

Users can mark steps as completed.

Example progress:

Total tasks: 6  
Completed: 2  

Progress = 33%

The progress bar automatically updates in the user dashboard.

---

# 6. Feature Module 3 – Transparent Complaint Portal

## Purpose

Enable citizens to report civic issues while ensuring transparency and accountability.

Examples of complaints:
- Potholes
- Broken streetlights
- Water supply problems
- Garbage accumulation
- Power outages

---

## Complaint Submission

Users fill a simple form containing:

- Issue description
- Location
- Optional image
- Anonymous reporting toggle

The system assigns each complaint a unique identifier.

---

## AI Auto-Triage

After submission, an AI agent analyzes the complaint text.

The system extracts:

Department responsible:
Examples:
- Public Works Department
- Electricity Board
- Municipality
- Water Authority

Priority Score

A score between 1 and 10 is generated based on:
- Severity keywords
- Public safety risk
- Infrastructure impact

Example:

Complaint:
Large pothole near school entrance.

Department: Public Works Department  
Priority Score: 8

---

## Public Feed

All complaints appear in a public feed visible to nearby users.

The feed can be displayed as:
- A map
- A list view

This allows community awareness of ongoing civic issues.

---

## Community Verification

Other users can verify complaints.

Each verification increases:
- Complaint credibility
- Priority score

Example:

Verification count increases from 2 to 5  
Priority increases from 6 to 8

---

## Transparency Mechanism

Government officials update complaint status through the dashboard.

Status lifecycle:

Pending  
Assigned  
In Progress  
Resolved

Status updates are visible in real-time to citizens.

---

# 7. Database Architecture

The platform uses two main types of databases.

---

## Vector Database

Options:
- ChromaDB
- pgvector (PostgreSQL extension)

Purpose:
Store embeddings of official documents for semantic search.

Stored content includes:
- Government scheme documents
- Policy guidelines
- Business procedures

Metadata fields include:
- source_document
- page_number
- category
- tags

---

## Relational Database (Supabase)

Supabase provides:

- Authentication
- PostgreSQL database
- API access

---

## Profiles Table

Stores citizen profile data.

Fields:
- user_id
- age
- income
- occupation
- location

---

## User Activities Table

Stores saved checklists and progress.

Fields:
- activity_id
- user_id
- activity_type
- checklist_json
- progress_percentage

Example checklist format:

{
 "tasks": [
   {"name": "GST Registration", "completed": true},
   {"name": "Fire NOC", "completed": false}
 ]
}

---

## Complaints Table

Stores complaint records.

Fields:
- complaint_id
- user_id (hidden for anonymity)
- description
- department
- priority_score
- status
- verification_count
- timestamp

---

# 8. User Interface Design

## Citizen Interface

Design goals:
- Mobile-first
- Minimal friction
- Fast search interaction

Main UI components:

Dashboard  
Search bar  
My Activities panel  
Local Complaint Feed

---

## Interaction Flow

1. User types a query in the search bar.

2. AI processing animation appears.

3. Results are displayed in structured cards.

Each result card shows:
- Answer
- Citation
- Explanation
- Action buttons

Example actions:
- Save to activity
- View source document

---

## Complaint Form

Simple submission form with:

Description  
Location  
Anonymous toggle  
Submit button

Once submitted, the complaint appears instantly in the local feed.

---

# 9. Government Dashboard

The government dashboard provides tools for monitoring and resolving complaints.

Design:
Desktop-first
Dark mode interface

---

## Command Center

Shows key performance indicators.

Examples:

Critical complaints  
Community verified issues  
Resolved cases today

---

## Complaint Triage Table

Displays complaints sorted by priority.

Columns include:

Complaint description  
Department  
Priority score  
Verification count  
Current status

---

## Action Panel

Officials can perform actions such as:

Assign team  
Update complaint status  
Add public notes

Citizens immediately see status updates.

---

# 10. Technical Stack

Frontend

Next.js  
Tailwind CSS  
Shadcn UI  
Framer Motion

---

Backend

FastAPI (Python)

Responsibilities:
- API endpoints
- AI agent coordination
- database access

---

AI and Agent Framework

LangChain or LangGraph

Agents:
- Orchestrator agent
- Scheme intelligence agent
- Business consultant agent
- Complaint triage agent

---

AI Models

Gemini 1.5 Flash – reasoning and orchestration  
Text-Embedding-004 – document embeddings

---

Storage

Supabase
- Authentication
- PostgreSQL

ChromaDB
- Vector storage for RAG

---

# 11. Hackathon Demo Flow

Step 1 – User Login

A user logs into the platform.

---

Step 2 – Complex Query

User types:

"Can I get government schemes for opening a cafe?"

---

Step 3 – AI Processing

The orchestrator agent routes the query.

The scheme agent retrieves relevant documents.

The system returns:
- eligibility result
- citation
- explanation

---

Step 4 – Save Activity

User saves the generated business checklist.

The checklist appears in the activity panel.

Progress bar starts at 0%.

---

Step 5 – Complaint Demonstration

Phone 1 reports a pothole.

Complaint appears immediately on the government dashboard.

Phone 2 verifies the complaint.

Priority score increases automatically.

---

Step 6 – Government Response

An official updates the complaint status.

Pending → In Progress → Resolved

The citizen interface updates in real-time.

---

# 12. Expected Impact

Astra Gov AI demonstrates how agentic AI systems can improve public service delivery.

Key benefits include:

Better access to government schemes  
Simplified business setup processes  
Transparent civic issue reporting  
Community-driven accountability

The system can eventually scale to support multiple cities and integrate directly with government service platforms.

---

# End of Plan