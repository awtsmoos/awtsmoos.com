<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase 03 — Cloud Primitives

Awtsmoos should replace the experience of needing AWS, not copy hundreds of AWS screens. A user asks for an outcome; Awtsmoos composes the required primitives behind one project identity.

## Priority order

1. Static hosting/CDN and immutable deployments.
2. Domains, DNS, TLS.
3. Object/file storage.
4. Serverless JavaScript functions/APIs.
5. Managed project database.
6. Project authentication and roles.
7. Secrets/bindings.
8. Durable queues/background jobs.
9. Cron/events/workflows.
10. Managed Node/container compute.
11. Transactional email.
12. Backups/restore and disaster recovery.
13. Capacity scheduler, dedicated compute, regions, failover.
14. Bring-your-own-server/Tunnel placement.

## Common resource law

Every resource has immutable ID, project owner, lifecycle state, capability policy, usage counters, health, audit history, created/updated timestamps, and a graph representation. UI, OS, Tunnel, CLI, and ChatGPT call the same APIs.

## Isolation and cost law

Shared infrastructure is preferred for low-cost workloads, but tenant identity and resource limits must be explicit. Static files use content-addressed objects/CDN; sporadic APIs use bounded function workers; background work uses queues; larger workloads graduate to isolated managed compute. Never give each tiny website a dedicated VM by default.

## AWS-style mapping

Compute → Awtsmoos Compute; S3 → Drive/Objects; Lambda → Functions; RDS/Dynamo-style needs → Project Database; CloudFront → Edge/CDN; Route 53 → Domains/DNS; Cognito → Project Identity; Secrets Manager → Secrets; SQS/EventBridge → Queues/Events; CloudWatch → Observe; ECS/Fargate → Managed Compute; SES → Mail; Cost Explorer → Peruta Usage; AWS Console → Geelooy OS.

## Completion test

A small SaaS should be creatable without leaving Awtsmoos: frontend, API, database, auth, storage, background email/job, domain, secrets, logs, metrics, backup, deployment, rollback, and bounded billing all exist under one project.
