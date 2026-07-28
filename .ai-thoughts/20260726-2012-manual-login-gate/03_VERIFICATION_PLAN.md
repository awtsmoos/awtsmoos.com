B"H

# Verification Plan

1. Syntax-check every changed JavaScript file.
2. Unit-test login polling, timeout, automatic close, and redacted results.
3. Unit-test 28 strict attempts, round-robin ordering, and ten-second pacing.
4. Source-audit the command path for DOM selectors, clicks, composer fallback, and secrets.
5. Run the existing direct relay, cancellation, host-reuse, leak, and transport tests.
6. Verify runtime-manifest parity and all source line limits.
7. Dry-run the command with injected fake authentication so no real login is needed for CI.
