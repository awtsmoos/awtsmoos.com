# Worker Beis backend audit

# Backend Audit: Recursive AI Task Spawning Engine

**Scope:** Core infrastructure requirements for a hierarchical task decomposition and execution system.

---

## 5 Concrete Backend Requirements

### 1. Task Graph Persistence & State Machine
- **Requirement:** Every spawned task must persist as a node in a directed acyclic graph (DAG) with parent-child lineage.
- **Details:** Store task status (`PENDING`, `RUNNING`, `COMPLETE`, `FAILED`, `CANCELLED`), timestamps, input/output payloads, and depth level.
- **API Need:** `POST /tasks`, `GET /tasks/{id}`, `GET /tasks/{id}/children`, `PATCH /tasks/{id}`.

### 2. Spawn Rate Limiting & Quota Guards
- **Requirement:** Enforce per-queue and per-session spawn limits to prevent runaway recursion.
- **Details:** 
  - Max depth threshold (e.g., `max_depth: 10`)
  - Max children per task (e.g., `max_children: 5`)
  - Global spawn rate limiter (e.g., 100 tasks/minute)
- **Behavior:** Reject spawn requests exceeding limits with `429 Too Many Requests`.

### 3. Async Execution with Cancellation Propagation
- **Requirement:** Child tasks must be cancellable when a parent fails or is explicitly cancelled.
- **Details:** Implement cancellation tokens that propagate down the task tree. Use message queue (e.g., RabbitMQ, SQS) with visibility timeouts for graceful abortion.
- **Trigger:** `PATCH /tasks/{id}` with `status: CANCELLED` must cancel all descendent tasks.

### 4. Idempotency & Deduplication
- **Requirement:** Prevent duplicate task spawning for identical inputs within a time window.
- **Details:** Generate deterministic task hash from `{parent_id, task_type, input_hash}`. Store in Redis with TTL. Reject duplicate spawns or return existing task ID.
- **API Need:** `GET /tasks/lookup?hash={task_hash}`.

### 5. Observability & Tracing
- **Requirement:** Full distributed tracing across the task tree.
- **Details:**
  - Emit OpenTelemetry spans for each task lifecycle event
  - Structured logging with `task_id`, `parent_id`, `depth`, `duration_ms`
  - Metrics: `tasks_spawned_total`, `tasks_completed_total`, `avg_depth`, `spawn_rate_per_second`
- **Alerting:** Notify on `task_failed_rate > 5%` or `max_depth_exceeded` events.

---

## Summary Table

| ID | Requirement | Failure Risk |
|----|-------------|--------------|
| R1 | DAG persistence | State loss, orphan tasks |
| R2 | Rate limiting | Resource exhaustion |
| R3 | Cancellation propagation | Zombie tasks |
| R4 | Idempotency | Duplicate work, wasted compute |
| R5 | Observability | Undebuggable failures |

**Next Step:** Prioritize R1 (foundation) + R2 (safety) before enabling recursive spawning in production.
