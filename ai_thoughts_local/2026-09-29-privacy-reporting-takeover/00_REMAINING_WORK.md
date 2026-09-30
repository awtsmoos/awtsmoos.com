B"H

# Remaining Work — Privacy / Reporting Production Takeover

## Current evidence
- Native route identity is preserved: tun_RC99m5Wz75O789hZ0pIsay5p.
- Original Mac main is dirty/conflicted and remains read-only.
- Isolated release branch starts from clean origin/main / production SHA b58ce700ffaab066b3340ec7405ff309ac39c265.
- Production is currently clean and converged with origin/main.
- Recommendation privacy is not present in origin/main and remains OFF.
- Installed tunnel runtime does not yet advertise missionVisibilityReport.

## Required closure nodes
1. Reconstruct inspected mission visibility v3, manifest/bootstrap 1.7, and Mission Control report-summary source in the isolated release lane.
2. Implement default-off minimized recommendation privacy with explicit category semantics, bounded retention, aggregate recomputation, profile reset, export/delete, and one-time GET mutation receipts.
3. Build visible privacy controls and rewrite both public privacy policies to match actual implementation.
4. Add privacy core, HTTP-boundary, fuzz, account-isolation, mission-report UI, and manifest/bootstrap regression tests.
5. Update external-agent/agent guidance without weakening GET-only/OAuth/transfer/recovery contracts.
6. Run focused and general syntax/diff/line/test gates; re-read every touched file.
7. Produce 50+ concrete follow-on ideas, dependency/risk-prioritized, and sub-agent-safe work decomposition.
8. Isolated commit and push exact SHA.
9. Reinspect production divergence, canonical SSH activate exact SHA, tolerate bounded restart turbulence.
10. Publicly prove manifest 1.7, privacy default OFF, controls/policies, report summaries, production SHA, services, watchdog, and tunnel reconnection.
11. Only after live proof, record the user's explicit account-level enablement and immediately verify exactly what was stored.
12. Publish implementation/verification/deployment/handoff mission reports once the refreshed installed runtime advertises missionVisibilityReport.
