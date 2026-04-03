# 🎯 Celebaltech – Fullstack Developer (Python + AI) Mastery Checklist
### Role Level: 5 Years | Focus: Everything Except Frontend (React/Next.js)
> ✅ = Done | 🔄 = In Progress | ⬜ = Not Started

---

## 📦 SECTION 1 — PYTHON (Core to Advanced)
> You know a little. This section takes you from basics to production-grade Python.

### 1.1 Language Fundamentals
- [ ] **Data Types & Type Hints** — int, str, list, dict, set, tuple + `typing` module (List, Dict, Optional, Union)
- [ ] **Functions** — *args, **kwargs, default params, lambda, higher-order functions
- [ ] **List/Dict Comprehensions** — One-liners for filtering, transforming data (used everywhere in backend)
- [ ] **OOP** — Classes, inheritance, dunder methods (`__init__`, `__repr__`, `__str__`), abstract classes
- [ ] **Decorators** — Writing and using decorators; used heavily in FastAPI route definitions
- [ ] **Context Managers** — `with` statement, writing custom context managers using `__enter__/__exit__`
- [ ] **Generators & Iterators** — `yield`, lazy evaluation; critical for streaming LLM responses
- [ ] **Exception Handling** — `try/except/finally`, custom exceptions, raising errors with context
- [ ] **Modules & Packages** — `__init__.py`, relative imports, package structure, `__name__ == "__main__"`
- [ ] **File I/O** — Reading/writing txt, JSON, CSV files; `pathlib` for path management

### 1.2 Intermediate Python
- [ ] **Async/Await** — `asyncio`, `async def`, `await`, event loop; mandatory for FastAPI and LLM streaming
- [ ] **Concurrency** — Threads vs Processes vs Async; `concurrent.futures`, `asyncio.gather()`
- [ ] **Dataclasses** — `@dataclass` decorator; cleaner alternative to plain classes for data models
- [ ] **Pydantic** — Data validation using models; used as the backbone of FastAPI request/response schemas
- [ ] **Environment Variables** — `python-dotenv`, `os.environ`; secure config management
- [ ] **Logging** — `logging` module, log levels, structured logging; never use `print()` in production
- [ ] **Testing with Pytest** — Writing unit tests, fixtures, mocking with `unittest.mock`, `pytest-asyncio`
- [ ] **Virtual Environments** — `venv`, `conda`; dependency isolation best practices
- [ ] **Dependency Management** — `requirements.txt`, `pyproject.toml`, `Poetry`

### 1.3 Advanced Python
- [ ] **Metaclasses** — Classes that create classes; understand how FastAPI and Pydantic use them internally
- [ ] **Descriptors** — `__get__`, `__set__`; used in ORM field definitions
- [ ] **Memory Management** — Garbage collection, reference counting, memory profiling with `tracemalloc`
- [ ] **Performance Profiling** — `cProfile`, `line_profiler`; identify bottlenecks in code
- [ ] **Design Patterns** — Singleton, Factory, Repository, Strategy in Python context

---

## 🔌 SECTION 2 — BACKEND APIs (Python)

### 2.1 FastAPI (Primary — Industry Standard for AI APIs)
- [ ] **Project Setup** — `uvicorn`, `fastapi`, project folder structure (routers, models, services, utils)
- [ ] **Path & Query Parameters** — `@app.get("/items/{id}")`, `Query()`, `Path()` validators
- [ ] **Request Body** — Pydantic models as request schemas, nested models, optional fields
- [ ] **Response Models** — `response_model=`, status codes, custom error responses
- [ ] **Dependency Injection** — `Depends()` for reusable logic (auth, DB sessions, pagination)
- [ ] **Middleware** — CORS (`CORSMiddleware`), request logging, timing middleware
- [ ] **Background Tasks** — `BackgroundTasks`; fire-and-forget jobs (e.g., sending emails after response)
- [ ] **WebSockets** — `@app.websocket("/ws")`; used for real-time LLM streaming to frontend
- [ ] **Server-Sent Events (SSE)** — `StreamingResponse` + `EventSourceResponse`; LLM token streaming
- [ ] **Exception Handlers** — `@app.exception_handler()`, `HTTPException`, custom error formats
- [ ] **File Uploads** — `UploadFile`, `File()`; accepting documents for RAG ingestion
- [ ] **Authentication** — JWT tokens with `python-jose`, OAuth2 with `Depends(oauth2_scheme)`
- [ ] **API Versioning** — Using `APIRouter` with prefixes (`/v1`, `/v2`)
- [ ] **OpenAPI Docs** — Auto-generated Swagger UI; customizing title, description, tags

### 2.2 Flask (Secondary — You May Already Know Basics)
- [ ] **Blueprints** — Modular route organization for large Flask apps
- [ ] **Flask-RESTful / Flask-RESTX** — Structured REST API building with resource classes
- [ ] **Request Context** — `request.json`, `request.args`, `g` object, app context vs request context
- [ ] **Error Handling** — `@app.errorhandler()`, returning JSON errors consistently
- [ ] **Flask with Async** — `flask[async]`, handling async routes in Flask

### 2.3 API Design Principles
- [ ] **REST Best Practices** — Proper HTTP verbs, status codes, resource naming, idempotency
- [ ] **Pagination** — Offset-based and cursor-based pagination patterns
- [ ] **Rate Limiting** — `slowapi` for FastAPI, token bucket algorithm concept
- [ ] **API Security** — Input validation, SQL injection prevention, OWASP Top 10 awareness
- [ ] **Webhook Design** — Receiving and verifying webhooks (HMAC signatures)

---

## 🗄️ SECTION 3 — DATABASES

### 3.1 SQL (PostgreSQL)
- [ ] **Core SQL** — SELECT, JOIN (INNER/LEFT/RIGHT), GROUP BY, HAVING, subqueries, CTEs (`WITH`)
- [ ] **Indexes** — B-tree, composite indexes, when to index, EXPLAIN ANALYZE for query plans
- [ ] **Transactions** — ACID properties, `BEGIN/COMMIT/ROLLBACK`, isolation levels
- [ ] **SQLAlchemy (ORM)** — Models, sessions, relationships, lazy vs eager loading, migrations
- [ ] **Alembic** — Database migration tool used with SQLAlchemy; `alembic upgrade head`
- [ ] **Connection Pooling** — `asyncpg`, SQLAlchemy connection pool config for high-concurrency APIs
- [ ] **Full-Text Search** — PostgreSQL `tsvector`, `tsquery`; useful before adding vector DB

### 3.2 NoSQL (MongoDB)
- [ ] **Core Concepts** — Documents, collections, BSON, schema flexibility
- [ ] **CRUD Operations** — `find_one`, `insert_one`, `update_many`, `delete_one`, query operators (`$gt`, `$in`)
- [ ] **Aggregation Pipeline** — `$match`, `$group`, `$project`, `$lookup` (joins); powerful for analytics
- [ ] **Indexes in MongoDB** — Single field, compound, TTL indexes; `explain()` for query optimization
- [ ] **Motor (Async MongoDB)** — `motor.motor_asyncio` for using MongoDB with FastAPI/asyncio
- [ ] **Schema Design Patterns** — Embedding vs referencing, denormalization for read performance

### 3.3 Redis
- [ ] **Data Structures** — Strings, Lists, Sets, Sorted Sets, Hashes, Streams
- [ ] **Caching Patterns** — Cache-aside, write-through, TTL eviction; caching LLM responses
- [ ] **Session Storage** — Storing JWT sessions or user context in Redis
- [ ] **Pub/Sub** — Redis channels for real-time messaging between services
- [ ] **Redis as Queue** — Using Lists as a simple job queue; `LPUSH/BRPOP` pattern
- [ ] **`redis-py` / `aioredis`** — Sync and async Python clients

### 3.4 Vector Databases (Critical for RAG/AI)
- [ ] **What is a Vector DB** — Stores embeddings (float arrays), enables semantic similarity search
- [ ] **Pinecone** — Managed vector DB; index creation, upsert, query with filters
- [ ] **Chroma** — Open-source, local/self-hosted; easiest to start with for RAG projects
- [ ] **Milvus** — High-scale, production-grade vector DB; used in enterprise RAG pipelines
- [ ] **pgvector** — Vector search extension for PostgreSQL; store embeddings alongside relational data
- [ ] **ANN Algorithms** — HNSW, IVF_FLAT; understand approximate nearest-neighbor tradeoffs

---

## 🤖 SECTION 4 — AI / LLM INTEGRATION (Core Differentiator)

### 4.1 LLM Fundamentals
- [ ] **How LLMs Work** — Tokens, context window, temperature, top-p, max_tokens, stop sequences
- [ ] **OpenAI API** — Chat completions, function calling, vision, embeddings endpoints
- [ ] **Anthropic Claude API** — Messages API, system prompts, extended thinking (you already have this)
- [ ] **OpenRouter SDK** — Multi-model routing; fallbacks, cost optimization (you already have this)
- [ ] **Prompt Engineering** — Zero-shot, few-shot, chain-of-thought, structured output prompting
- [ ] **Structured Outputs** — Getting JSON from LLMs via `response_format`, function calling, or Instructor lib
- [ ] **Streaming Responses** — `stream=True`, processing `delta.content` chunks for real-time UI
- [ ] **Embeddings** — `text-embedding-ada-002`, `text-embedding-3-small`; converting text to float vectors
- [ ] **Token Counting** — `tiktoken` for OpenAI; managing context window limits in long conversations

### 4.2 LangChain (Deep Mastery Required)
- [ ] **Core Concepts** — Chains, Runnables, LCEL (LangChain Expression Language) pipeline syntax
- [ ] **LLMs & Chat Models** — `ChatOpenAI`, `ChatAnthropic`, `ChatOllama` wrappers
- [ ] **Prompt Templates** — `ChatPromptTemplate`, `MessagesPlaceholder`, `HumanMessagePromptTemplate`
- [ ] **Output Parsers** — `StrOutputParser`, `JsonOutputParser`, `PydanticOutputParser`
- [ ] **Memory** — `ConversationBufferMemory`, `ConversationSummaryMemory`, `RunnableWithMessageHistory`
- [ ] **Document Loaders** — `PyPDFLoader`, `TextLoader`, `WebBaseLoader`, `CSVLoader`
- [ ] **Text Splitters** — `RecursiveCharacterTextSplitter`, chunk size/overlap strategy
- [ ] **Retrievers** — `VectorStoreRetriever`, `MultiQueryRetriever`, `ContextualCompressionRetriever`
- [ ] **RAG Chain** — Full pipeline: Load → Split → Embed → Store → Retrieve → Generate
- [ ] **Tools & Agents** — `@tool` decorator, `create_react_agent`, tool binding to LLMs
- [ ] **Callbacks** — `StreamingStdOutCallbackHandler`, custom callbacks for logging/monitoring
- [ ] **LangChain with FastAPI** — Integrating chains into API endpoints with streaming

### 4.3 LangGraph (Advanced — Explicitly in JD)
- [ ] **Core Concept** — Build stateful, multi-actor AI workflows as directed graphs
- [ ] **StateGraph** — Defining graph state with `TypedDict`, adding nodes and edges
- [ ] **Nodes** — Python functions that read/write to shared state; each node = one AI step
- [ ] **Edges** — Unconditional (`add_edge`) vs conditional (`add_conditional_edges`) routing
- [ ] **Checkpointing** — `MemorySaver`, `SqliteSaver`; persisting graph state across turns
- [ ] **Human-in-the-Loop** — `interrupt_before`, `interrupt_after`; pausing graphs for human approval
- [ ] **Multi-Agent Architecture** — Supervisor agent, subagent graphs, agent handoffs
- [ ] **Streaming in LangGraph** — `.stream()`, `.astream()`, streaming intermediate node outputs
- [ ] **ReAct Pattern** — Reason + Act loop; implementing tool-using agents with LangGraph
- [ ] **Parallel Nodes** — Running multiple nodes concurrently within a graph branch

### 4.4 RAG Architecture (You have some exposure — go deeper)
- [ ] **Naive RAG** — Basic retrieve-then-generate pipeline; understand its failure modes
- [ ] **Advanced RAG** — Query rewriting, HyDE (Hypothetical Document Embeddings), re-ranking
- [ ] **Agentic RAG** — LangGraph-based RAG where agent decides when/how to retrieve
- [ ] **Hybrid Search** — Combining dense (vector) + sparse (BM25/keyword) retrieval for better recall
- [ ] **Re-ranking** — Cohere Rerank, cross-encoders; improving precision after initial retrieval
- [ ] **Chunking Strategies** — Fixed, semantic, recursive, parent-document chunking; impact on retrieval quality
- [ ] **Evaluation** — RAGAs framework; metrics like faithfulness, answer relevancy, context precision
- [ ] **Guardrails** — Input/output validation, hallucination detection, topic filtering

### 4.5 Additional AI Tools
- [ ] **Instructor Library** — Force structured Pydantic output from any LLM; zero hallucination schemas
- [ ] **LlamaIndex** — Alternative to LangChain; strong for document-heavy RAG use cases
- [ ] **Ollama** — Running LLMs locally (Llama 3, Mistral); useful for development/testing
- [ ] **Hugging Face** — Loading models with `transformers`, using `pipeline()` for classification/NER

---

## ☁️ SECTION 5 — AWS (Cloud Infrastructure)

### 5.1 Core Services (Must Know)
- [ ] **IAM** — Users, roles, policies, principle of least privilege; never use root credentials
- [ ] **EC2** — Launch instances, key pairs, security groups, AMIs, instance types (t3, c5, g4 for GPU)
- [ ] **S3** — Buckets, objects, presigned URLs, lifecycle policies, static website hosting
- [ ] **VPC** — Subnets (public/private), route tables, Internet Gateway, NAT Gateway, security groups
- [ ] **RDS** — Managed PostgreSQL/MySQL; Multi-AZ, read replicas, automated backups
- [ ] **ElastiCache** — Managed Redis/Memcached; caching layer for APIs
- [ ] **Lambda** — Serverless functions; event triggers (S3, API Gateway, SQS), cold start management
- [ ] **API Gateway** — REST & HTTP APIs; connecting Lambda to HTTP endpoints with auth
- [ ] **SQS** — Message queues; decoupling services, FIFO vs standard queues
- [ ] **CloudWatch** — Logs, metrics, alarms, dashboards; monitoring your deployed application

### 5.2 Container & Deployment Services
- [ ] **ECR** — Elastic Container Registry; pushing Docker images for ECS/EKS deployment
- [ ] **ECS (Fargate)** — Running containers serverlessly; task definitions, services, clusters
- [ ] **EKS** — Managed Kubernetes; understand when to use over ECS (scale, complexity)
- [ ] **Elastic Beanstalk** — Simplified app deployment; auto-provisions EC2/ALB/ASG
- [ ] **ALB** — Application Load Balancer; path-based routing, health checks, SSL termination
- [ ] **Auto Scaling** — Scale EC2/ECS tasks based on CPU/memory/custom metrics

### 5.3 AI/ML Specific AWS Services
- [ ] **Bedrock** — AWS-managed LLMs (Claude, Titan, Llama); invoke via API without managing infra
- [ ] **SageMaker** — Training and deploying custom ML models; endpoints, batch transforms
- [ ] **Kendra** — Enterprise document search; managed RAG-like retrieval service

### 5.4 AWS Security & Cost
- [ ] **Secrets Manager** — Storing API keys, DB passwords; never hardcode credentials
- [ ] **KMS** — Key Management Service; encrypting data at rest and in transit
- [ ] **Cost Explorer** — Understanding AWS billing; tagging resources for cost allocation
- [ ] **AWS Well-Architected Framework** — 6 pillars: Operational Excellence, Security, Reliability, Performance, Cost, Sustainability

---

## 🔵 SECTION 6 — AZURE (Secondary Cloud)

### 6.1 Core Azure Services
- [ ] **Azure Active Directory (Entra ID)** — Identity management, service principals, managed identities
- [ ] **Azure App Service** — PaaS for deploying Python/Node apps; deployment slots, scaling
- [ ] **Azure Functions** — Serverless compute; HTTP triggers, timer triggers, blob triggers
- [ ] **Azure Blob Storage** — Object storage equivalent of S3; containers, access tiers
- [ ] **Azure SQL / Cosmos DB** — Managed relational DB and NoSQL (multi-model: MongoDB API, Gremlin)
- [ ] **Azure Service Bus** — Enterprise messaging; queues and topics (like SQS + SNS combined)
- [ ] **Azure Redis Cache** — Managed Redis; same concepts as ElastiCache
- [ ] **Azure Container Apps** — Serverless container hosting (like ECS Fargate on Azure)
- [ ] **Azure Kubernetes Service (AKS)** — Managed Kubernetes equivalent to EKS

### 6.2 Azure AI Services
- [ ] **Azure OpenAI Service** — Hosted GPT-4o, embeddings; GDPR/data residency compliance use case
- [ ] **Azure AI Search** — Managed vector + keyword search; often used as RAG retriever in enterprise Azure stacks
- [ ] **Azure Cognitive Services** — Vision, Speech, Language APIs; pre-built AI capabilities
- [ ] **Azure ML Studio** — End-to-end ML lifecycle management

---

## 🐳 SECTION 7 — DOCKER & CONTAINERS

- [ ] **Dockerfile** — `FROM`, `RUN`, `COPY`, `CMD`, `ENTRYPOINT`, `ENV`, `EXPOSE`; multi-stage builds
- [ ] **Docker Compose** — `docker-compose.yml`; multi-container local dev setup (app + postgres + redis)
- [ ] **Image Optimization** — `.dockerignore`, slim base images (`python:3.11-slim`), layer caching
- [ ] **Container Networking** — Bridge, host, overlay networks; inter-container communication
- [ ] **Volumes** — Persistent storage in containers; bind mounts vs named volumes
- [ ] **Container Registry** — Pushing to Docker Hub, ECR, ACR; tagging conventions
- [ ] **Health Checks** — `HEALTHCHECK` in Dockerfile; used by ECS/Kubernetes for liveness probes
- [ ] **Environment Injection** — Passing secrets/config via `--env-file` or orchestrator secrets

---

## ☸️ SECTION 8 — KUBERNETES (K8s Fundamentals)

- [ ] **Core Objects** — Pod, Deployment, Service, Namespace, ConfigMap, Secret
- [ ] **Deployments** — Rolling updates, rollback, replica sets, resource limits
- [ ] **Services** — ClusterIP, NodePort, LoadBalancer; exposing pods internally and externally
- [ ] **Ingress** — Routing external HTTP traffic to services; NGINX Ingress controller
- [ ] **ConfigMaps & Secrets** — Injecting config and credentials into pods
- [ ] **Persistent Volumes** — PV, PVC, StorageClass; stateful workloads in K8s
- [ ] **Horizontal Pod Autoscaler (HPA)** — Autoscaling pods based on CPU/custom metrics
- [ ] **Helm** — Kubernetes package manager; deploying charts, `values.yaml` customization
- [ ] **kubectl** — Core commands: `apply`, `get`, `describe`, `logs`, `exec`, `port-forward`

---

## 🔄 SECTION 9 — CI/CD & DEVOPS

- [ ] **Git Advanced** — Branching strategies (Git Flow, trunk-based), rebasing, cherry-pick, stash
- [ ] **GitHub Actions** — Writing workflows (`.github/workflows/`); build, test, deploy pipelines
- [ ] **GitLab CI** — `.gitlab-ci.yml`; stages, jobs, artifacts, caching
- [ ] **Pipeline Stages** — Lint → Test → Build Docker Image → Push to Registry → Deploy
- [ ] **Secrets in CI/CD** — Using GitHub Secrets / GitLab CI variables; never hardcode in YAML
- [ ] **Infrastructure as Code (IaC)** — Terraform basics: `init`, `plan`, `apply`; provisioning AWS resources
- [ ] **Blue-Green Deployments** — Zero-downtime deployments; two identical environments, traffic switching
- [ ] **Canary Releases** — Gradual traffic shifting to new version; reduce blast radius of bad deploys
- [ ] **Monitoring in CI/CD** — Integrating test coverage reports, SonarQube for code quality

---

## 🔐 SECTION 10 — SECURITY BEST PRACTICES

- [ ] **OWASP Top 10** — Injection, Broken Auth, SSRF, Security Misconfiguration, etc.; understand all 10
- [ ] **JWT Security** — Algorithm choice (RS256 vs HS256), token expiry, refresh token rotation, blacklisting
- [ ] **OAuth 2.0 / OIDC** — Authorization Code Flow, PKCE, scopes; integrating Google/GitHub login
- [ ] **HTTPS/TLS** — Certificate management, SSL termination at load balancer, HSTS headers
- [ ] **Secret Management** — Never in code/git; use Secrets Manager, Vault, or env vars
- [ ] **Input Validation** — Pydantic for APIs; parameterized queries (never string concat for SQL)
- [ ] **Rate Limiting** — Prevent abuse; per-IP and per-user limits
- [ ] **CORS** — Proper configuration; whitelist origins, never `*` in production
- [ ] **Container Security** — Non-root user in Docker, read-only filesystem, minimal base images
- [ ] **Dependency Scanning** — `pip audit`, `snyk`; catching vulnerable packages before deployment
- [ ] **LLM Security** — Prompt injection attacks, jailbreaks, data leakage through LLM responses

---

## 🏗️ SECTION 11 — SYSTEM DESIGN (5-Year Level)

### 11.1 Distributed Systems Fundamentals
- [ ] **CAP Theorem** — Consistency, Availability, Partition Tolerance; trade-offs in distributed databases
- [ ] **ACID vs BASE** — SQL (ACID) vs NoSQL (BASE) trade-offs; when to choose each
- [ ] **Consistent Hashing** — How distributed caches/DBs partition data; minimizes re-distribution
- [ ] **Event-Driven Architecture** — Producers, consumers, topics; async decoupled services
- [ ] **Message Queues** — SQS, RabbitMQ, Kafka; at-least-once vs exactly-once delivery

### 11.2 Scalability Patterns
- [ ] **Horizontal vs Vertical Scaling** — Adding more machines vs bigger machines; stateless services
- [ ] **Caching Strategies** — CDN caching, application caching, DB query caching; cache invalidation
- [ ] **Database Sharding** — Partitioning data across multiple DB instances; shard key selection
- [ ] **Read Replicas** — Scaling read-heavy workloads; eventual consistency implications
- [ ] **Load Balancing** — Round-robin, least-connections, IP hash; sticky sessions
- [ ] **API Rate Limiting** — Token bucket, sliding window; implementing in distributed systems

### 11.3 AI System Design (Key for This Role)
- [ ] **RAG System Architecture** — Ingestion pipeline, retrieval pipeline, generation pipeline components
- [ ] **LLM Gateway** — Centralized routing, rate limiting, cost tracking, fallback for LLM calls
- [ ] **Async LLM Processing** — Queue-based architecture for long-running LLM tasks
- [ ] **Streaming Architecture** — SSE/WebSocket for real-time LLM output to users
- [ ] **Vector DB Scaling** — Indexing strategy, namespace isolation per tenant, approximate search tuning
- [ ] **Multi-Tenant AI Apps** — Isolated knowledge bases per client; data segregation in shared infra
- [ ] **Observability** — LLM token usage tracking, latency monitoring, cost per request dashboards

### 11.4 Common System Design Problems (Practice These)
- [ ] Design a RAG-based document Q&A system for enterprise
- [ ] Design a scalable AI hiring platform (you built this — now explain the architecture)
- [ ] Design a real-time collaborative tool with AI assistance
- [ ] Design a multi-tenant SaaS platform with per-tenant data isolation
- [ ] Design an LLM API gateway with rate limiting and fallback

---

## 📊 SECTION 12 — OBSERVABILITY & MONITORING

- [ ] **Structured Logging** — JSON logs with request ID, user ID, latency; `structlog` or `loguru`
- [ ] **Distributed Tracing** — OpenTelemetry; trace requests across microservices, LLM calls
- [ ] **Metrics** — Prometheus + Grafana; custom metrics for API latency, error rate, LLM token usage
- [ ] **Error Tracking** — Sentry integration; automatic error capture with stack traces
- [ ] **LLM Observability** — LangSmith (LangChain native), Arize, Helicone; trace LLM chains in production
- [ ] **Health Check Endpoints** — `/health` and `/ready` endpoints; used by load balancers and K8s
- [ ] **Alerting** — PagerDuty/OpsGenie integration; alert on error rate spikes, latency degradation

---

## 🧪 SECTION 13 — TESTING (Backend)

- [ ] **Unit Testing (Pytest)** — Pure function tests, parameterized tests, fixtures, conftest.py
- [ ] **Mocking** — `unittest.mock.patch`, `MagicMock`; mocking LLM calls, DB calls, external APIs
- [ ] **Integration Testing** — Testing API endpoints with `TestClient` (FastAPI) or real DB
- [ ] **Contract Testing** — Pact; ensuring API contracts between frontend and backend services
- [ ] **Load Testing** — Locust, k6; simulating concurrent users; finding breaking points
- [ ] **Test Coverage** — `pytest-cov`; targeting >80% coverage on critical business logic
- [ ] **LLM Testing** — Evaluating LLM output quality; using LangSmith eval, RAGAs, or custom evals

---

## 🧩 SECTION 14 — MICROSERVICES & ARCHITECTURE PATTERNS

- [ ] **Microservices vs Monolith** — Trade-offs, when to split; strangler fig pattern for migration
- [ ] **API Gateway Pattern** — Single entry point; auth, rate limiting, routing at gateway level
- [ ] **Service Discovery** — How services find each other; Consul, AWS Cloud Map, K8s DNS
- [ ] **Circuit Breaker** — Preventing cascading failures; `tenacity` library for retries + backoff
- [ ] **Saga Pattern** — Managing distributed transactions without 2PC; choreography vs orchestration
- [ ] **CQRS** — Command Query Responsibility Segregation; separate read and write models
- [ ] **Event Sourcing** — Storing state as sequence of events; audit trail, replay capability
- [ ] **Sidecar Pattern** — Attaching auxiliary services (logging, proxy) alongside main container in K8s

---

## 📅 SUGGESTED LEARNING SEQUENCE

```
Week 1-2  : Python (Sections 1.1 → 1.3) + FastAPI deep dive (Section 2.1)
Week 3-4  : Databases — PostgreSQL + MongoDB + Redis (Section 3.1-3.3)
Week 5-6  : LangChain full mastery + LangGraph (Sections 4.2-4.3)
Week 7    : RAG Architecture deep dive (Section 4.4) + Vector DBs (Section 3.4)
Week 8-9  : AWS Core Services + Docker (Sections 5.1-5.2 + Section 7)
Week 10   : Security + System Design (Sections 10-11)
Week 11   : CI/CD + Monitoring + Testing (Sections 9, 12, 13)
Week 12   : Azure overview + Microservices patterns (Sections 6, 14)
Ongoing   : System design practice (1 problem/day from Section 11.4)
```

---

## 🎯 INTERVIEW FOCUS AREAS FOR CELEBALTECH

Based on the JD, expect deep questions in:

| Area | Weight | Your Current Level |
|------|--------|--------------------|
| LangChain + LangGraph | ⭐⭐⭐⭐⭐ | Medium (RAG done, LangGraph partial) |
| FastAPI + Python Backend | ⭐⭐⭐⭐⭐ | Beginner → needs fastest ramp |
| AWS Architecture | ⭐⭐⭐⭐ | Basic exposure via projects |
| RAG System Design | ⭐⭐⭐⭐ | Medium (built one in prod) |
| Docker + K8s | ⭐⭐⭐ | Likely minimal — needs work |
| System Design (AI focus) | ⭐⭐⭐⭐ | Strong storytelling from EMB |
| Security Best Practices | ⭐⭐⭐ | OWASP + JWT knowledge needed |

---

> **Total Topics: ~190+ checklist items**  
> **Priority Order: LangChain/LangGraph → FastAPI → AWS → Docker → System Design → Azure**  
> Built for Dharmvir Dharmacharya | Celebaltech Interview Prep | April 2026
