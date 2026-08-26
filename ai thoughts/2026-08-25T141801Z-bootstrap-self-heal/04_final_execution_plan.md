B"H
Boruch Hashem
Blessed is He

# Final Execution Plan — One Public Curl, Many Self-Healing Layers

## Read / trace first

1. Finish reading release metadata, recovery store/resume/rescue, package stage, activation, and API route source.
2. Trace the exact clean-install path when `~/.awtsmoos-tunnel` is absent.
3. Trace source-to-production deployment/version mechanism.
4. Inspect existing tests for clean install, missing root, offline recovery, release metadata outage, and route rendering.

## Source changes only if evidence requires them

- Bootstrap layer: keep `unix.sh` self-contained enough to bootstrap from zero live state.
- Recovery layer: make metadata outage consult verified recovery candidates when live root is absent/corrupt.
- Node/runtime layer: eliminate remaining bare `node` execution in installer success paths.
- Route layer: ensure `/api/tunnel/install/unix` lazily injects component checksum and never depends on agent ZIP merely to return bootstrap text.
- Tests/docs: add clean-root/corrupt-root bootstrap regressions and production-route contract.

## Verification sequence

1. Static syntax/style/line gates.
2. Existing + new recovery regressions.
3. Isolated temporary-HOME install simulation with live root absent.
4. Isolated corrupt-root repair simulation.
5. Local HTTP/API route simulation.
6. Build/publish intended new release.
7. Fetch public Unix installer and verify new signatures/checksum.
8. Execute the exact user command on the real Mac while Tier-0 remains connected.
9. Prove primary supervisor, agent, version, receipt, project root, service guardian, sealed slot, durable rescue commands.
10. Confirm emergency retires only after primary registration.
11. Run the exact command once more as an idempotent explicit restart/repair proof.
12. Re-read every touched file, compare planned vs actual, close remaining work, write final evidence ledger.
