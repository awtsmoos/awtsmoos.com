B"H

# File Map

## Runtime
- `debugChromeDiscovery.cjs`: discovers only local DevTools targets.
- `debugChromeWebSocket.cjs`: carries bounded browser-level CDP commands.
- `cdpChrome.cjs`: launches, synchronizes, reports, and closes the dedicated profile.
- `commands/ManualLoginGate.cjs`: waits for manual authentication.
- `commands/StrictNoDomStress.cjs`: runs the four-by-seven request-only sequence.
- `commands/VerificationSuite.cjs`: runs the deterministic automated checks.
- `commands/loginOnly.cjs`: login and close.
- `commands/loginAndStress.cjs`: login, close, test, reopen, stress, close.

## Integration
- `server.cjs`: exposes a safe debug-Chrome close route.
- `package.json`: exposes operator commands.
- `runtime-files.txt`: packages every new runtime module.
