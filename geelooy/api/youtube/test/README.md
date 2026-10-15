# B"H — YouTube Tests (geelooy/api/youtube/test/)

Security tests for the YouTube family (`security.test.cjs`): verifies OAuth
configuration handling, secret isolation (secrets written to a temp dir, never
committed), and token/session key guards.

Run with Node's built-in test runner.
