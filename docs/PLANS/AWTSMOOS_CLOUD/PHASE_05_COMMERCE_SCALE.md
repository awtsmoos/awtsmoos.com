<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase 05 — Commerce, Security, Observability, and Scale

## Economic model

Perutas become the common usage-accounting layer, but customers see understandable plan allowances first: sites, bandwidth, storage, database, compute, AI/build actions, email, jobs, and support. Server-authoritative metering converts real resource usage into plan/Peruta charges.

## Suggested commercial ladder

Free for experimentation; Launch for one serious site; Creator for multiple creative projects; Business for production operations; Agency for many client sites; Scale for high traffic; Enterprise for custom requirements. Prices and included limits remain catalog/config data, not hard-coded UI assumptions.

## Billing invariants

- Quote before expensive work.
- Reserve maximum expected credits/allowance.
- Execute server-side work.
- Finalize actual usage.
- Release unused reservation.
- Refund/release automatically on failed fulfillment.
- Same idempotency key with changed intent always conflicts.
- Hard user/team/project spending caps prevent surprise bills.

## Security and abuse

Treat hosting as an adversarial product: scoped project identity, strict Origin/CORS/CSRF, CSP, secret isolation, rate limits, upload scanning, phishing/spam/malware/crypto-mining detection, suspension/appeal workflows, audit history, and emergency kill switches. Financial mutations, compute, authentication, uploads, rewards, and email each need independent rate policy.

## Observability

Every request/job/deployment should carry request ID, project ID, deployment ID, release SHA, actor/capability identity, duration, outcome, and privacy-scrubbed error testimony. Track uptime, latency, errors, resource use, queue time, provider latency, capacity, conversion, refunds, reconciliation, and infrastructure cost.

## Scale transition

File-backed atomic state is useful for semantics but hot financial/cloud control data must move toward an ACID transactional datastore before serious concurrency. Public static metadata can be cached aggressively; user/account/financial state must remain private and correctly invalidated.

## Completion test

Growth must increase gross profit rather than merely traffic: each plan's revenue, infrastructure cost, payment cost, support burden, abuse cost, and margin can be measured per customer/project without hidden overages.
