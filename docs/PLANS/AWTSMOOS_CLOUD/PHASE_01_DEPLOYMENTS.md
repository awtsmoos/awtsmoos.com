<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase 01 — Immutable Hosting Deployments

## Goal

Editable project files remain mutable. Production always points to an immutable deployment manifest. Publish creates a revision; rollback atomically changes the active deployment pointer; no rollback rewrites source files.

## Core invariant

A deployment manifest maps normalized relative paths to previously persisted content-addressed Drive object hashes. Therefore editing or deleting the working file after publication cannot mutate the deployed bytes.

## Current architecture

- Drive alias state is normalized at schema version 7 and includes `deployments`.
- `deploymentPolicy.js` validates deployment IDs/manifests and bounded retention.
- `deploymentService.js` creates/lists/reads/rolls back deployments.
- `deploymentServiceSupport.js` handles capture, activation, pruning, and audit details.
- `siteSourcePolicy.js` recognizes `drive-deployment` snapshot sources.
- `siteSourceResolution.js` resolves immutable deployment paths.
- `deploymentSiteResponse.js` serves manifest-selected object hashes.
- `deploymentReadiness.js` produces readiness testimony.
- `deploymentRoutes.js` exposes guarded management routes.

## Required verification sequence

1. Route crown loads deployment routes without collisions.
2. Old state normalizes safely to version 7.
3. Publish captures only active public files beneath the requested root.
4. Publish refuses missing `index.html`, bad hashes, traversal, invalid IDs, oversized manifests.
5. Production response remains byte-identical after working-source mutation.
6. Directory index, immutable 404, MIME, HEAD, Range, ETag/304 behavior remain correct.
7. Rollback changes the public object hash without rewriting working files.
8. Missing/wrong-site deployment IDs fail closed.
9. Concurrent publishes/rollbacks cannot silently stomp one another.
10. Same idempotency key with different publish intent is a conflict.
11. Preview deployment does not become production until explicitly promoted.
12. Post-publish health distinguishes configured, internally ready, and externally verified.

## Professional completion

Website Maker, Tunnel, Geelooy OS, and direct API clients must all use this same deployment service. UI must show revision, actor, timestamp, message, health, preview URL, current production marker, and one-click rollback.

## Do not do

- Never treat mutable Drive paths as immutable production after this phase.
- Never label configuration as externally healthy without an HTTP/browser witness.
- Never duplicate object bytes just to create a revision when content hashes already identify them.
- Never expose private manifest entries through public site serving.
