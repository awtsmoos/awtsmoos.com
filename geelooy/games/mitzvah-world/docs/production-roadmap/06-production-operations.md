B"H

# Production Operations, Security, Privacy, and Capacity

## Security

- Define guest/account authentication, guest-to-account progress transfer, secure sessions, CSRF/XSS defenses, CSP, security headers, strict mutable API validation, and rate limits.
- Protect uploads and migration endpoints; keep credentials ephemeral, scoped, redacted, rotated, and absent from Git/client bundles.
- Run dependency/vulnerability review and edge/DDoS protection appropriate to scale.
- Add moderation/reporting and construction/social abuse controls if public user-generated content ships.

## Privacy and account lifecycle

- Minimize telemetry and personal data.
- Document retention, privacy behavior, export, deletion, and account recovery.
- Keep logs/save data free of tokens and unrelated personal data.
- Apply appropriate protections if children or teens are an intended audience.

## Observability

- Record build ID, boot success, crash-free sessions, frame-time distribution, asset failures, save failures, endpoint latency, catalog generation, and backend capacity.
- Add privacy-conscious client error reports, structured diagnostics receipts, alert thresholds, and incident runbooks.
- Monitor Drive asset serving, CDN/cache correctness, saves/APIs, and Tunnel as separate operational domains.

## Capacity and cost

- Load-test public asset serving and all stateful services.
- Use immutable content-hash URLs and CDN edge caching; keep mutable aliases/catalogs small and revalidatable.
- Measure bandwidth/egress before making full-resolution textures default.
- Precompute popular derivatives and avoid uncached request-time transforms.
- Track storage/index/file-descriptor limits and content-addressed store integrity.
- Garbage-collect only truly unreferenced immutable blobs after a long compatibility retention window.

## Deployment and recovery

- Separate development, staging, and production configuration/assets/saves.
- Use canary releases, feature flags, release receipts, automatic rollback thresholds, and staged rollout.
- Back up repository state, catalogs, content-addressed assets, and stateful databases/saves.
- Test actual restoration from backup.
- Keep rollback for both code deployment and asset catalog publication.
