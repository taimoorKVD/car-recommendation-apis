# 🚗 AI-Powered Car Recommendation System

A **production-grade, AI-driven car recommendation system** built with **Node.js**, **MySQL**, **OpenAI embeddings**, and **Qdrant**.

This project demonstrates how modern recommendation and search systems are built using:

* semantic understanding (embeddings),
* vector databases,
* user behavior learning,
* dynamic intent interpretation,
* constraint-aware ranking,
* and explainable results.

> This is **not keyword search**.
> This is **semantic, personalized, explainable AI**.

---

## 🧠 What This System Does

✔ Understands natural language queries
✔ Learns from user behavior (search, click, booking)
✔ Builds **user preference embeddings**
✔ Uses **vector similarity** for recommendations
✔ Dynamically interprets constraints & intent (LLM-powered)
✔ Applies **hard constraints**, **soft preferences**, and **objectives**
✔ Generates **truthful, contextual explanations**
✔ Handles cold-start users gracefully

---

## 🏗️ High-Level Architecture

```
User Query
   ↓
LLM Query Interpretation (dynamic intent)
   ↓
Query Embedding (OpenAI)
   ↓
User Embedding (from events, with time decay)
   ↓
Vector Search (Qdrant)
   ↓
Constraint Filtering (hard rules)
   ↓
Preference Boosting (soft rules)
   ↓
Objective Ranking (price, etc.)
   ↓
Explainable Results
```

---

## 🧱 Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| API          | Node.js + Express                 |
| Database     | MySQL                             |
| ORM          | Sequelize                         |
| Embeddings   | OpenAI (`text-embedding-3-small`) |
| Vector DB    | Qdrant (Cloud)                    |
| AI Reasoning | OpenAI Chat Models                |
| Architecture | ESM (ES Modules)                  |

---

## 📂 Project Structure

```
src/
├── config/
│   ├── db.js                 # MySQL connection
│   ├── openai.js             # OpenAI client
│   └── qdrant.js             # Qdrant client
│
├── models/
│   ├── Car.js
│   └── UserEvent.js
│
├── routes/
│   ├── cars.routes.js
│   └── events.routes.js
│
├── services/
│   ├── embedding.service.js
│   ├── userEmbedding.service.js
│   ├── userVector.service.js
│   ├── recommendation.service.js
│   ├── explanation.service.js
│   ├── intent.service.js
│   ├── queryInterpreter.service.js   # 🔥 LLM-based intent parsing
│   ├── domain.service.js              # Dynamic domain discovery
│   ├── timeDecay.util.js
│   └── qdrant.setup.js
│
├── database/
│   └── seeder/
│       └── cars.js
│
├── utils/
│   └── vectorMath.js
│
└── server.js
```

---

## 🔑 Core Concepts Implemented

### 1️⃣ Embeddings

* Cars, queries, and user behavior are converted into vectors
* Enables **semantic similarity**, not keyword matching

### 2️⃣ Vector Database (Qdrant)

* Stores car and user embeddings
* Performs fast cosine similarity search

### 3️⃣ User Learning (Online Learning)

* User actions are stored as events
* User embeddings are rebuilt automatically
* **Time decay** ensures recent behavior matters more

### 4️⃣ Dynamic Query Interpretation (LLM-Powered)

User queries are converted into structured intent:

```json
{
  "hard_constraints": {
    "exclude": [{ "field": "type", "value": "SUV" }]
  },
  "soft_preferences": {
    "type": "Sedan"
  },
  "objectives": [
    { "field": "price", "direction": "asc" }
  ]
}
```

✔ No hard-coded rules
✔ Handles negation, ambiguity, synonyms
✔ Schema-validated & DB-aware

---

## 🧠 Constraint-Aware Ranking

The system distinguishes between:

| Type            | Meaning         | Example           |
| --------------- | --------------- | ----------------- |
| Hard Constraint | Must / must not | “SUV not allowed” |
| Soft Preference | Nice to have    | “Sedan”           |
| Objective       | Optimization    | “most cheap”      |

Execution order:

1. Vector relevance
2. Hard filtering
3. Preference boosting
4. Objective sorting

---

## 💡 Explainable AI

Each result includes a **truthful explanation**, e.g.:

```json
{
  "brand": "Tesla",
  "model": "Model 3",
  "explanation": "Recommended because it matches your preference for sedan cars."
}
```

Explanations are:

* request-aware
* constraint-aware
* relative (never misleading)
* deterministic (no hallucination)

---

## 🌐 API Endpoints

### 🔹 Recommend Cars

```
GET /cars/recommend/:userId?query=...
```

Example:

```
GET /cars/recommend/1?query=most cheap but SUV not allowed
```

---

### 🔹 Log User Events (Clicks / Bookings)

```
POST /events
```

Body:

```json
{
  "userId": 1,
  "eventType": "click",
  "carId": 2
}
```

> Search events are logged automatically when recommendations are requested.

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=4000

DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=car_recommendation

OPENAI_API_KEY=your_openai_key

QDRANT_URL=https://your-qdrant-url
QDRANT_API_KEY=your_qdrant_api_key
```

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Seed database & index cars

```bash
npm run db:seed
```

### 3️⃣ Start server

```bash
npm run start
```

Server runs at:

```
http://localhost:4000
```

---

## 🧪 Example Queries to Try

```
family SUV with good mileage
reliable sedan
most cheap but SUV not allowed
any car that is beyond comfort
```

Each query demonstrates:

* semantic understanding
* dynamic intent handling
* constraint enforcement
* explainable output

---

## 🧠 Design Principles Used

* **Embeddings for relevance**
* **Rules for constraints**
* **LLMs for understanding**
* **Deterministic execution**
* **DB as source of truth**
* **Explainability by design**

---

## 🏁 Current Capabilities

✔ Semantic search
✔ Personalized recommendations
✔ Dynamic intent interpretation
✔ Constraint-aware ranking
✔ Time-decayed learning
✔ Explainable AI
✔ LLM safety & validation

---

## 🔮 Possible Next Enhancements

* Session-based intent memory
* Confidence-based clarification
* Evaluation metrics (precision@k)
* Frontend UI (React / Next.js)
* A/B testing framework

---

## 👏 Final Note

This project demonstrates **real AI system design**, not just API usage.

If you understand this codebase, you understand:

> how modern AI-powered recommendation systems are actually built.