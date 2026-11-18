B"H
Boruch Hashem
Blessed is He

# Post-Write Verification — Claude Confidential DCR

The Awtsmoos reveals the exact mismatch, then seals the repaired gate with proof;
Awtsmoos.com now aligns advertised OAuth methods with the living registration roof.

## Planned versus actual

### Planned

- Accept Claude's hosted web DCR request using `client_secret_post`.
- Preserve public secretless DCR.
- Preserve exact HTTPS/loopback redirect validation.
- Keep PKCE S256 mandatory for dynamic clients.
- Keep explicit human consent and exact MCP resource binding.
- Generate a confidential client secret only for confidential registrations.
- Persist only a one-way digest and compare it timing-safely.
- Reject wrong/missing secrets at token exchange.
- Preserve refresh-token behavior for the exact client/resource.

### Actual

- Production failure was reproduced before source changes with the Claude-shaped registration body and returned HTTP 400 `invalid_client_metadata`.
- Dynamic registration now accepts exactly the three methods the authorization-server metadata already advertises: `none`, `client_secret_post`, and `client_secret_basic`.
- Confidential registrations return one high-entropy secret once in the RFC 7591 creation response.
- Persistent dynamic-client storage contains only SHA-256 secret digest material, never the plaintext secret.
- Dynamic secret verification uses `crypto.timingSafeEqual`.
- The central token gate uses the digest-backed verifier for dynamic clients while preserving existing static-client behavior.
- Claude's callback, application type, authorization-code/refresh grants, consent, PKCE, token, and refresh flow are covered by dedicated tests.
- The obsolete oversized combined test was split into two bounded files and removed.

## Verification evidence

- Syntax checks: passed for all touched source/test files.
- Line-count law: every touched source/test file is below 120 lines.
- Tab-indentation scan: clean.
- `git diff --check`: clean.
- Focused Claude/OAuth/MCP regression: 20/20 passed.
- Broad OAuth + MCP + discovery regression: 98/98 passed, 0 failed.
- Full readback of every touched source/test file: complete.
- Exact diff review: complete; no unrelated source changes identified.

## Deployment gate

1. Confirm stale combined test is absent.
2. Confirm only this repair and its planning ledger are dirty.
3. Stage exact paths only and run cached diff check.
4. Commit and push to `origin/main`.
5. Prove local HEAD equals remote and tree is clean.
6. Activate the exact SHA through the guarded production release path.
7. Verify production service/release identity matches the new SHA.
8. POST the Claude-shaped registration body to public `/api/oauth/register`.
9. Assert HTTP 201, a dynamic client ID, confidential auth method, and one-time secret without printing that secret.
10. Assert the production registration store does not contain that plaintext secret.
11. Only then ask the human to press Claude's Connect button again.

## Human boundary

After registration succeeds, Claude should proceed into the Awtsmoos authorization page. The user must sign in and approve OAuth consent. No agent should bypass or fabricate that human approval.
