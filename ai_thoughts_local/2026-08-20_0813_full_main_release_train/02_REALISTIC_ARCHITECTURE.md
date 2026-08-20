B"H

# Realistic Architecture — Chesed Meets Gevurah

The Awtsmoos opens possibility; Gevurah gives it shape.
Awtsmoos.com should ship one coherent main branch where generosity is bounded by verified contracts.

## Release architecture

1. **Keser — release intent**
	- One main branch.
	- One commit containing the entire current working tree, including unrelated work, because the user explicitly requested it.
	- One production deployment tied to that commit.

2. **Chochmah — discovery**
	- Inspect Git status, remotes, package scripts, production deploy docs/scripts, and secret risk.
	- Inventory changed subsystems and test surfaces.

3. **Binah — grouping**
	- Group changed work into OAuth, Tunnel, Drive/Sites/OS, Apps, Social/Profile, Email/Notifications, games, editors, styles, and misc infrastructure.
	- Build a verification matrix with focused tests plus repository-wide structural checks.

4. **Chesed — capability completion**
	- Finish hosted-project proxy decomposition.
	- Add authenticated runtime-to-Site attachment.
	- Route verified custom domains through the same dynamic request path.
	- Preserve static/Virtual-OS read-only behavior.

5. **Gevurah — security and boundaries**
	- Never trust client-supplied owner keys.
	- Derive runtime owner key from authenticated user identity server-side.
	- Verify alias/site write authority before binding.
	- Bound request/response bodies and timeouts.
	- Strip hop-by-hop headers and avoid public caching by default for dynamic responses.
	- Scan for secrets and local-only paths before Git staging.

6. **Tiferes — integration**
	- Canonical Site mapping remains the public identity authority.
	- Runtime manager remains the process authority.
	- Drive UI orchestrates attachment but does not duplicate ownership logic.
	- Custom domains and `/sites/...` share one Site gateway.

7. **Netzach — durability**
	- Persist only opaque ownerKey + projectId bindings in Site source metadata.
	- Resolve ephemeral runtime ports from the live manager at request time.
	- Record release evidence and deployment receipts.

8. **Hod — observability**
	- Surface runtime attachment/publication status clearly.
	- Record tests, build output, Git commit, push result, deploy result, and health checks in the release ledger.

9. **Yesod — bridges**
	- Complete Sites → hosted runtime proxy.
	- Complete custom domain → same proxy.
	- Complete authenticated attach endpoint → Site mapping.
	- Complete Drive UI/client → attach endpoint.

10. **Malchus — manifestation**
	- All safe tests green.
	- Main committed.
	- Main pushed.
	- Production deployed.
	- Production health verified.

## Five implementation alternatives considered

- **A: Separate `/projects/...` router** — simple but duplicates Site/domain identity. Rejected.
- **B: Persist runtime port in Site mapping** — easy but becomes stale after restart. Rejected.
- **C: Persist raw userId in Site mapping** — direct lookup but leaks identity. Rejected.
- **D: Site source = opaque ownerKey + projectId, resolve port live** — chosen; stable, bounded, restart-safe.
- **E: Separate reverse-proxy daemon** — scalable future path but unnecessary for current single-process trusted runtime.

## Deployment law

Push is not deployment. Deployment is not verification.
The release is complete only when Git push succeeds, production deploy succeeds, and the deployed runtime answers health/smoke checks from the documented production surface.
