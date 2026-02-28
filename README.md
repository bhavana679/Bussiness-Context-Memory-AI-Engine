# Business Context Memory AI Engine

An intelligent credit risk platform built for enterprise distributor networks. It combines structured financial analysis with a semantic memory layer — powered by vector embeddings and FAISS — to evaluate creditworthiness in a way that accounts for behavioral patterns and historical context, not just raw numbers.

**Deployment Link:** [Live Application](https://bussinesscontextmemoryaiengine.vercel.app/welcome) &nbsp;|&nbsp; **Video Demonstration:** [Demo Video](https://drive.google.com/file/d/19HMItjrjSmaTJ0sn5NWgufKnO4wsx-hB/view?usp=sharing)

---

## What It Does

Most credit scoring tools look at numbers in isolation. This one doesn't.

The engine maintains four distinct layers of memory for every distributor in the network. Each layer contributes different signal to the final risk decision — from raw transactional data to patterns learned from historically similar situations. These four memory types are queried together at evaluation time, combined into a composite risk score, and used to drive real-time alerts pushed over an authenticated WebSocket channel.

The final risk score blends structured financial signals (60%) with semantic pattern matching from experiential memory (40%).

---

## Memory Architecture

The system's core design is built around four types of context memory. Together, they give the engine the ability to reason about a distributor's current state, their track record, how recent that track record is, and how their situation compares to historically similar cases.

### Memory Type 1 — Immediate Context

Captures the current transaction state of a distributor at the moment a credit decision is requested.

**What is stored:**
- Current credit request amount
- Current outstanding balance
- Current credit utilization percentage
- Pending invoices

**Role in the system:** Feeds directly into the structured risk computation. Utilization alone carries a 30% weight in the final structured score. A distributor at 92% utilization is flagged immediately as a critical alert regardless of history.

**Source:** `MemoryService.get_immediate_memory()` in `memory_service.py`

---

### Memory Type 2 — Historical Context

Reflects structured financial behavior over a rolling 90-day window.

**What is stored:**
- Payment delays (average days late per invoice)
- Dispute records (count of flagged invoices)
- Delay frequency (ratio of late invoices to total)
- Credit increase history and default records

**Role in the system:** Forms the base financial risk signal. Drives three of the four structured risk components — payment delay (40% weight), dispute intensity (20% weight), and partially informs the sales momentum calculation.

**Computed metrics:**
- Delay frequency over the 90-day window
- Rolling 90-day performance score
- 12-month stability index (through aggregation)

**Source:** `MemoryService.get_historical_memory()` in `memory_service.py`

---

### Memory Type 3 — Temporal Context

Addresses the *context validity problem*: not all past data is equally relevant. A distributor who was consistently late two years ago but has been clean for six months should be treated differently from one who started missing payments last month.

**What is captured:**
- Seasonal stress patterns
- Recent improvement or deterioration trends
- Trend acceleration signals
- Industry-wide downturns

**Recency weighting formula:**

```
weight = e^(-λ × time_difference)
```

Where `λ = 0.1` and `time_difference` is measured in months. This exponential decay means a case from 12 months ago carries roughly 30% of the weight of an identical case from today.

**Role in the system:** Applied during the semantic retrieval phase to re-rank similar historical cases before they influence the risk score. Recent high-severity events gain disproportionate influence; older cases fade progressively. Also used in conflict resolution when two retrieved cases give contradictory signals.

**Source:** `apply_temporal_decay()` in `semantic_risk.py`

---

### Memory Type 4 — Experiential Context

The most sophisticated layer. Rather than relying solely on structured metrics, the engine encodes past contextual events as dense vector representations and stores them in a FAISS index. When a new credit request arrives, the system finds the most semantically similar past situations and extracts their outcomes to inform the current decision.

This is a RAG-style (Retrieval-Augmented Generation) reasoning pattern applied to credit risk.

**Storage:** FAISS flat L2 index with 384-dimensional vectors, persisted to disk under `vector_storage/`

**Embedding model:** `all-MiniLM-L6-v2` via `sentence-transformers` (cached with `@lru_cache`)

**What is indexed:** Each `ContextualEvent` record — free-text descriptions of significant business events tied to a distributor — is embedded and stored with metadata including severity score, distributor ID, and timestamp.

**Source:** `embedding_service.py`, `vector_store.py`, `semantic_risk.py`

---

## Credit Evaluation Flow

This is the end-to-end sequence executed when a credit request is submitted.

**Step 1 — Request arrives**

User submits a credit increase request via the Credit Evaluation page. The request hits `POST /api/credit-request` with a `distributor_id` and `requested_amount`.

**Step 2 — Fetch Immediate and Historical Memory**

The backend queries Memory Types 1 and 2 in parallel:
- Outstanding balance, utilization percentage (Immediate)
- Average delay days, dispute count, delay frequency, sales trend (Historical)

**Step 3 — Build Context Summary**

The structured metrics are converted into a human-readable text summary:

```
Distributor showing significant payment delays, critically high credit utilization, and a steep decline in sales trend.
```

This summary is what gets embedded in the next step.

**Step 4 — Embed Context (Semantic Step)**

The text summary is passed through `all-MiniLM-L6-v2` to produce a 384-dimensional vector.

**Step 5 — FAISS Similarity Search**

The vector is queried against the FAISS index. The top 5 most similar past contextual events are retrieved with their L2 distances, severity scores, and timestamps. Example retrieved cases:

- *Similar distributor showed cash flow stress before defaulting*
- *Seasonal stress case, resolved after 60 days*
- *Credit increase followed by extended payment delays*

**Step 6 — Apply Temporal Decay (Memory Type 3)**

Each retrieved case is re-weighted based on its age using the exponential decay formula. Recent cases carry more influence on the final semantic score.

**Step 7 — Compute and Combine Scores**

The structured risk score and semantic risk score are computed independently and then blended:

```
final_risk = (0.6 × structured_risk) + (0.4 × semantic_risk)
```

The credit decision (`Approved`, `Conditional`, `Denied`) is returned along with the breakdown, top influential historical cases, and a plain-language explanation.

---

## Architecture

```
.
├── backend/                  # FastAPI application
│   ├── main.py               # App entrypoint, WebSocket manager, lifespan hooks
│   ├── config.py             # Pydantic settings (env-driven)
│   ├── database.py           # SQLAlchemy engine and session factory
│   ├── models/               # ORM models
│   │   ├── distributor.py
│   │   ├── invoice.py
│   │   ├── credit_request.py
│   │   ├── contextual_event.py
│   │   └── user.py
│   ├── routes/               # API route handlers
│   │   ├── auth.py           # /api/auth/signup, /api/auth/login
│   │   ├── distributors.py   # /api/distributors, /api/distributor/:id
│   │   ├── credit.py         # /api/credit-request, /api/credit-history
│   │   ├── alerts.py         # /api/alerts
│   │   └── dashboard.py      # /api/dashboard
│   ├── services/             # Business logic
│   │   ├── auth_service.py        # bcrypt hashing, user creation, credential validation
│   │   ├── jwt_service.py         # HS256 token signing and verification
│   │   ├── memory_service.py      # Immediate/historical/sales trend retrieval
│   │   ├── structured_risk.py     # Weighted risk scoring from financial metrics
│   │   ├── embedding_service.py   # SentenceTransformer (all-MiniLM-L6-v2) with LRU cache
│   │   ├── vector_store.py        # FAISS index management (add, search, persist, rebuild)
│   │   ├── semantic_risk.py       # Semantic retrieval + temporal decay + score computation
│   │   ├── alert_service.py       # Risk, utilization, and trend alert generation
│   │   ├── credit_service.py      # Credit decision logic
│   │   └── dashboard_service.py   # Portfolio-level aggregation
│   ├── schemas/              # Pydantic request/response models
│   └── requirements.txt
│
├── frontend/                 # React + Vite application
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Distributors.jsx
│       │   ├── DistributorProfile.jsx
│       │   ├── CreditEvaluation.jsx
│       │   └── Alerts.jsx
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── RiskGauge.jsx
│       │   ├── KpiCard.jsx
│       │   ├── SimilarCaseCard.jsx
│       │   └── ErrorBoundary.jsx
│       ├── store/            # Zustand state management
│       ├── hooks/            # Custom React hooks
│       ├── services/         # Axios API client
│       ├── locales/          # i18n translations (EN, HI)
│       └── utils/
│
└── vector_storage/           # Persisted FAISS index files (.index + .meta)
```

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.110 + Uvicorn |
| Database | SQLAlchemy 2.0 (SQLite dev / PostgreSQL prod) |
| Migrations | Alembic |
| AI / Embeddings | sentence-transformers (`all-MiniLM-L6-v2`), 384-dim vectors |
| Vector Search | FAISS (CPU) via `faiss-cpu` |
| Auth | bcrypt (passlib) + JWT (python-jose, HS256) |
| Validation | Pydantic v2 + pydantic-settings |
| Real-time | WebSocket (FastAPI native) |
| Production server | Gunicorn + Uvicorn workers |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | react-router-dom v7 |
| State | Zustand |
| HTTP | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| i18n | react-i18next (EN + HI) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

---

## Risk Scoring Model

The structured risk score (0–100) is a weighted sum of four normalized components:

| Factor | Weight | Source |
|---|---|---|
| Average payment delay | 40% | Historical invoices (90-day window) |
| Credit utilization | 30% | Current outstanding / credit limit |
| Dispute frequency | 20% | Flagged invoices in the 90-day window |
| Sales momentum decline | 10% | 30-day vs prior 30-day invoice volume |

The semantic risk score layers on top by finding the closest matching historical events in the FAISS index (L2 distance), weighting each match by its temporal relevance using exponential decay (`e^(-0.1 * months_old)`), and aggregating severity scores. The final composite score is:

```
final_risk = (0.6 × structured_risk) + (0.4 × semantic_risk)
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy and configure the environment file:

```bash
cp .env.example .env
```

Available environment variables:

```env
DATABASE_URL="sqlite:///./business_memory.db"
APP_NAME="Business Context Memory AI Engine"
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

Run the development server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs are at `/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The web application will be available at `http://localhost:5173`.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user, returns signed JWT |
| `POST` | `/api/auth/login` | Authenticate and return a signed JWT |

### Distributors

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/distributors` | Paginated list with search, industry, and risk filters |
| `GET` | `/api/distributor/{id}` | Full profile with structured + semantic risk diagnostics |

### Credit

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/credit-request` | Run a credit evaluation and store the decision |
| `GET` | `/api/credit-history` | Last 10 credit decisions |

### Alerts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | Current system-wide risk alerts |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Portfolio summary, risk distribution, exposure trend |

### WebSocket

```
ws://localhost:8000/ws/alerts?token=<jwt>
```

Authenticated endpoint. Pushes new or changed alerts in real time. The server polls every 5 minutes and only broadcasts alerts that are new or have changed since the previous cycle.

---

## Role-Based Access

The frontend enforces route-level access control via the `ProtectedRoute` component backed by JWT claims.

| Role | Access |
|---|---|
| `Admin` | Full access including Alerts and Credit Evaluation pages |
| `RiskOfficer` | Access to Credit Evaluation |
| All authenticated | Dashboard, Distributors, Distributor Profiles |

---

## Project Structure Notes

**Vector index persistence:** The FAISS index is saved to disk under `vector_storage/` as two files (`.index` binary and `.meta` pickle). On startup, if a saved index exists it is loaded; otherwise the engine boots with an empty index and builds incrementally as contextual events are added.

**Embedding cache:** Single-text embeddings are cached in memory using `@lru_cache(maxsize=1024)` on the `EmbeddingModel` class to avoid redundant inference calls.

**Database compatibility:** The `database.py` module detects whether the connection string is SQLite or PostgreSQL and configures the engine accordingly, including thread-safety settings for SQLite.

**Legacy password support:** `auth_service.py` includes a SHA-256 fallback in `verify_password` to support accounts created before the bcrypt migration. New accounts are always hashed with bcrypt.

---

## Deployment

The frontend is configured for Vercel deployment (`vercel.json` is present). The backend is production-ready with Gunicorn listed as a dependency for use with Uvicorn worker:

```bash
gunicorn main:app -k uvicorn.workers.UvicornWorker --workers 1 --bind 0.0.0.0:8000
```

Ensure the `DATABASE_URL` is updated to point to a persistent PostgreSQL instance in production, and that `DEBUG` is set to `False`.

---

## Internationalization

The frontend supports English and Hindi out of the box via `react-i18next`. Translations live in `frontend/src/locales/`. Language selection is exposed on the landing page and persists via browser language detection.

---

