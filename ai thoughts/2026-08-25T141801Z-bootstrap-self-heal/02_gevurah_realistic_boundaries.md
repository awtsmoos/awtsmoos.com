B"H
Boruch Hashem
Blessed is He

# Phase Two — Gevurah: Real Boundaries and Failure Proof

The Awtsmoos gives measure to expansion, and Awtsmoos.com should distinguish what can heal from what must fail clearly;
a self-healing installer should retry and fall back with evidence, never loop infinitely or destroy identity blindly.

## Confirmed facts from source

- `unix.sh` downloads `unix-node-runtime.sh`, `unix-bootstrap-components.sh`, and `unix-bootstrap-components-download.sh` into a fresh temporary runtime before sourcing them.
- Node discovery already checks recovery `state/node-bin.path`, explicit `AWTSMOOS_NODE_BIN`, PATH, Homebrew/MacPorts paths, `/usr/bin/node`, and NVM versions.
- Installer components already use SHA-256 verified caching and individual-file fallback.
- Current full-repair source now has automatic emergency continuity after failed primary replacement.
- The live emergency tunnel is PID 3693 and currently healthy.

## Remaining unknowns to resolve before source edits

1. Does release metadata failure with missing live root consult recovery archive/known-good candidates before fatal exit?
2. Does `resume_interrupted_install` safely reconstruct a missing live root from recovery transactions?
3. Does candidate staging require any live-root file that would be absent on a clean repair?
4. Can the normal release artifact be built/served from the current dirty checkout without touching unrelated `fakeSsh` work?
5. Does the installer route embed the current component SHA lazily and correctly?
6. Does the public production endpoint currently serve checkout source or a separately deployed generation?
7. What exact release/version publishing mechanism must be used to deploy a new version?
8. Can a local isolated install against a temporary HOME prove missing-root recovery without touching the live tunnel?

## Safety boundaries

- Do not delete or move the real live/recovery roots for simulation.
- Simulate missing-root installs under a temporary HOME first.
- Preserve the live Tier-0 tunnel until a new normal primary has fresh registration.
- Do not reset/stash/overwrite unrelated dirty files.
- Do not claim the public endpoint is updated until an HTTP fetch from `awtsmoos.com` proves the new source bytes.
- Do not claim deployment complete until `awtsmoosMyDevice` reports the new primary generation and emergency is retired afterward.
