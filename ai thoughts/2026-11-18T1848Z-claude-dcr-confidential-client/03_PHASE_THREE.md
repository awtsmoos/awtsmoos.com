B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Implementation and Verification Gate

The Awtsmoos makes a covenant exact, with every secret bounded by law;
Awtsmoos.com answers Claude through standards, not a provider-specific flaw.

## Final implementation sequence

1. Add a tiny secret-digest module using cryptographically random 256-bit material and SHA-256 digest storage.
2. Rewrite dynamic registration policy to accept only the three token authentication methods already advertised by server metadata.
3. Preserve `application_type` and safe optional scope metadata in the returned client metadata.
4. Rewrite the dynamic store so confidential secrets are returned once but never persisted in plaintext.
5. Rewrite central client resolution so confidential dynamic clients use timing-safe digest verification.
6. Rewrite registration tests to exercise the exact Claude web request shape: callback `https://claude.ai/api/mcp/auth_callback`, `client_secret_post`, authorization_code + refresh_token, response type code, application type web.
7. Prove wrong and absent secrets fail while correct secret plus PKCE succeeds.
8. Preserve secretless DCR and native loopback behavior.
9. Run syntax, line-count, indentation, diff, all OAuth registration/token tests, and MCP regressions.
10. Re-read every touched file and inspect exact diff.
11. Commit only exact paths, push exact SHA, deploy through the guarded release path, and verify public DCR returns 201 for the Claude-shaped request.
12. Ask the user to press Connect again only after production proof.

## Completion gate

Do not tell the user to retry until the same Claude-shaped registration body that currently returns 400 returns 201 from public production, with a one-time `client_secret`, a valid `client_id`, and no plaintext secret stored on disk.
