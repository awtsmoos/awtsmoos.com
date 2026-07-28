B"H

# Final Verification

## Operator Commands

From the repository root:

```bash
npm run ai:login-stress
```

Login-only mode:

```bash
npm run ai:login
```

## Verified Lifecycle

1. A dedicated visible Chrome profile opens at ChatGPT.
2. The human performs the complete login manually.
3. The command synchronizes cookies through local browser-level DevTools.
4. The existing redacted session verdict is polled until it reports `logged_in`.
5. Chrome closes immediately through `Browser.close`.
6. The deterministic direct-relay verification suite runs.
7. The same authenticated profile reopens without DOM automation.
8. Four logical streams each attempt seven strict request-only turns.
9. Every request start is separated globally by at least ten seconds.
10. The direct service and debug browser close in a `finally` boundary.

## Safety Contract

The operator path contains no selector lookup, click, typing, focus, composer submission, `Runtime.evaluate`, or `page-authorized-fallback`. Authentication credentials and cookie values are never logged. Strict request-only enforcement failures are reported safely rather than converted into DOM interaction.

## Evidence

- Focused login and stress tests: 4 passed, 0 failed.
- Full direct verification suite: 19 passed, 0 failed.
- Runtime manifest: 87 entries, 0 missing.
- Installer harness: passed.
- Relay harness: passed.
- Source line limit: every new command module is at or below 120 lines.
- DOM and secret source audit: clean.
- Real Chrome lifecycle: opened on 9223, synchronized nine cookies, closed with `Browser.close`, and became unavailable afterward.
- CLI timeout lifecycle: reported `manual_login_timeout`, exited nonzero, and left Chrome closed.
- Final ports: Chrome 9223 closed; relay 38488 closed.

## Honest Capability Boundary

A successful login proves authentication, not that ChatGPT permits a composer-free conversation POST in the current environment. The stress runner uses only `strict-request-only`. When normal enforcement is required, it records `direct_enforcement_required` with no composer contact and no automatic fallback.
