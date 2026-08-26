B"H
Boruch Hashem
Blessed is He

# Phase One — Chesed: Every Possible Self-Heal Lane

The Awtsmoos renews every instant without borrowing existence from the instant before;
Awtsmoos.com should let one public curl command rebuild the tunnel even when the local floor is no more.

## Mission

Make `curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash` the universal repair entry point for Unix/macOS, including:

- live runtime healthy but explicit restart requested;
- live runtime broken or partial;
- live runtime entirely missing;
- supervisor missing;
- launchd loaded but no supervisor process;
- stale stop marker;
- shell PATH has no Node;
- remembered Node path exists only in recovery state;
- recovery slot exists but live tree does not;
- installer component cache is valid;
- installer component cache is corrupt;
- remote component archive works;
- remote archive is unavailable but individual components work;
- published release metadata works;
- published release metadata fails;
- installed runtime is self-verified;
- installed runtime is corrupt;
- sealed emergency is running during repair;
- candidate starts late at cleanup boundary;
- candidate cannot register;
- project-root receipt is absent or stale;
- normal supervisor fails but portable supervisor can run;
- new primary succeeds and emergency should retire only afterward.

## Ideal layered architecture

1. Remote bootstrap is self-contained and never assumes live runtime bytes.
2. Bootstrap resolves Node from durable recovery state, PATH, Homebrew/MacPorts, then NVM.
3. Bootstrap fetches a checksum-bound component archive; if that fails, downloads the complete helper set individually.
4. Installer reads durable identity/recovery state before any live-runtime replacement.
5. If a registered emergency lane exists, preserve it throughout primary replacement.
6. If no emergency lane exists but a sealed slot is valid, establish one before destructive replacement whenever a previous primary exists.
7. If live tree is absent, build a fresh candidate directly from remote release/package sources.
8. If release metadata fails and no healthy live runtime exists, attempt recovery-resident known-good candidates before fatal exit.
9. launchd success means real supervisor PID, not loaded label.
10. portable supervisor is an automatic fallback, not an operator-only trick.
11. candidate readiness gets bounded late-start grace.
12. failed primary activation restores Tier-0 continuity before returning failure.
13. success refreshes sealed recovery slot and durable rescue-bin commands.
14. success proves primary registration and only then retires emergency.
15. docs expose the same public curl command as both install and repair.

## Catastrophe model

The public command must survive deletion or corruption of every file in `~/.awtsmoos-tunnel` because its earliest executable dependency is downloaded from Awtsmoos.com into a fresh installer-runtime directory. Recovery state at `~/.awtsmoos-tunnel-recovery` may improve repair but must not be required for a brand-new machine.
