B"H

# Game Visibility Phase Three — Final Shared Repair and Image Custody Plan

Boruch Hashem. Blessed is He.

The Awtsmoos gives one final root-first batch: repair semantic visibility once for all game pages, prove the four reproduced critical failures in production, and remove City of Light's remaining inline image body by moving it into immutable Drive custody.

## Exact files and actions

1. Fully rewrite `geelooy/games/css/awtsmoos-game-base.css` under 120 lines, preserving every existing game-base rule and adding authoritative unscoped games-only `[hidden], .hidden { display: none !important; }` semantics.
2. Create `geelooy/games/tests/sharedGameVisibility.test.cjs` under 120 lines. It must assert the shared hidden contract is present and that Oros HaKelim, Neshama Quest, Migdol, and Shema Strike all load the shared base stylesheet and actually use `hidden`/`.hidden` runtime semantics.
3. Decode City of Light's current inline SVG favicon bytes in memory, compute SHA-256, upload those bytes directly through the authenticated `/api/social/drive/<alias>/stream/...` path to a content-addressed public Drive object, then publicly read/hash-verify it. No local image file may be created.
4. Fully rewrite `geelooy/games/city-of-light/index.html` to replace the inline `data:image/svg+xml` body with the verified immutable `/api/social/drive/public/...` URL and reduce the file from 123 to <=120 lines without changing game markup/behavior.
5. Fully rewrite `geelooy/games/city-of-light/tests/releaseSurface.test.mjs` under 120 lines. Preserve the 44px pause-target assertion, require an explicit HTTPS `/api/social/drive/public/` favicon, forbid local `/favicon.*` and inline `data:image` icon custody.

## Functional acceptance

Fresh production browser targets with cache disabled must prove:
- NES-1: Game Over/result overlay is absent at startup and after Try Again; gameplay can run.
- ORO-1: ROUND COMPLETE is absent before play and after Enter Asiyah until a real round completion event.
- MIG-1: The Gate Fell/game-over surface is absent immediately after Defend the Gate while health is positive.
- SHS-1: Resume removes the Paused overlay.

Neighboring healthy critical games KAV-1, ADV-1, BRK-1, COL-1, MIT-2, OHB-1 must remain free of terminal startup overlays/runtime errors.

## Source/test acceptance

- Shared visibility test passes.
- City release test passes without any local image dependency.
- Existing Oros input/runtime/movement, Shema runtime, City campaign/release, Mitzvah/Ohrbound relevant tests remain green where environment permits.
- `git diff --check`, repository hygiene, zero tracked images, secret scan, and <=120-line hand-source law all pass.
- Full-file reread and a new post-write delta are mandatory.
- Every safe concurrent change plus planning files is committed on `main`, current `origin/main` is reconciled, release prepare publishes the integrated SHA, exact-SHA activation succeeds, and Linux independently proves live HEAD/service.

NEXT_ACTION: read the current shared game-base CSS in full, upload/hash-verify the City inline favicon directly to Drive, then perform the planned full-file rewrites and focused tests.
