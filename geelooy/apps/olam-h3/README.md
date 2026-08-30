<!-- B"H
Boruch Hashem
Blessed is He

The Awtsmoos lets a future maintainer enter Olam H3 without guessing which secret, endpoint, database, test, or release path keeps the studio alive;
Awtsmoos.com records the architecture in a compact doorway, while deeper verification rests in its own vessel so every file stays small and clear in the hive.
-->

# Olam H3 Studio

Olam H3 Studio is the mobile-first MiniMax H3 AI video workspace at `/apps/olam-h3/`. Every prompt, reference, and completed generation remains reusable material for the next shot.

## Security and server key

The browser never receives a MiniMax API key. The same Awtsmoos.com server exposes the narrow proxy under `/api/olam-h3/` and reads `MINIMAX_API_KEY` from the server process environment.

Settings exposes only `configured: true|false`; it never returns the secret. The local implementation environment reported `configured: false`, so no fake paid MiniMax success was substituted for a missing credential.

## MiniMax H3 V2 endpoints

The proxy uses:

- `POST https://api.minimax.io/v2/video_generation`
- `GET https://api.minimax.io/v2/query/video_generation/{task_id}`

Successful H3 V2 queries expose the result through `task.content.url`. Olam persists that remote URL immediately and can separately cache the completed video Blob in IndexedDB.

## Capability configuration

`./scripts/config/h3.js` is the centralized provider capability source. The current H3 configuration includes:

- 768P and 2K output
- 4–15 second integer generation duration
- fixed 16:9, 9:16, 1:1, 21:9, 4:3, and 3:4 text ratios
- adaptive ratio for reference/frame workflows
- first frame, last frame, or both
- reference images, video, and audio
- up to 9 reference images, 3 reference videos, and 3 reference audio files
- timed reference clips constrained to 2–15 seconds

Frame control and reference mode are intentionally separated. The UI disables generation until the selected mode has the material it requires.

## Pricing configuration

`./scripts/config/pricing.js` is the single pricing source. Version `2026-08-30-h3-paygo` records:

- 768P output: `$0.08 / generated second`
- 2K output: `$0.13 / generated second`
- first 5 input images: free
- each additional input image: `$0.04`
- reference audio input: free
- reference video input: charged per input second at the selected output-resolution rate

Usage is local accounting based only on generations recorded by this app; it is not a MiniMax billing statement.

## IndexedDB schema

Database: `olam-h3-studio`, version `1`.

Stores:

- `generations` — request snapshot, settings, asset IDs, task/status/result, cost snapshot, errors, favorites, tags
- `assets` — reusable metadata and one local Blob where appropriate
- `prompts` — deduplicated reusable prompt history
- `preferences` — defaults and cache policy
- `videoCache` — optional completed video Blobs keyed by generation ID

Generations reference asset IDs, so large reusable assets are not duplicated for every creation.

## Persistence and recovery

A generation record is saved before submission. Once MiniMax returns a task ID, it is persisted immediately. Reload restores unfinished task polling when a task ID exists.

If the browser closes before a task ID is persisted, the interrupted record becomes an actionable failed creation instead of a ghost job. H3 V2 task queries stop after the documented seven-day query window instead of polling forever.

Completed-video cache preference supports `never`, `ask`, and `automatic`. A cached Blob takes playback precedence over the remote result URL.

## Reusable workspace flows

The studio includes searchable prompt memory, reusable asset categories/tags/favorites, generation search/history, Build from this, Reuse Prompt, Reuse References, Edit & Regenerate, Duplicate, completed-video-as-reference, and ordered reference media.

Metadata JSON export includes generations, prompts, preferences, pricing metadata, tags, and asset metadata. Large local Blobs/videos are deliberately excluded and marked instead of being embedded into huge JSON files.

## Verification and operations

Detailed local release evidence lives in [`docs/release-verification.md`](./docs/release-verification.md).

Use the repository's normal Awtsmoos.com server process. No second backend exists for Olam H3 Studio. A typical local route is `http://127.0.0.1:8080/apps/olam-h3/`; the development port may differ.

The parent catalog entry is composed through `geelooy/apps/scripts/catalog/creation.mjs` and `creation-ai.mjs`.

For an isolated release in a shared worktree, never use blanket `git add -A`. Commit only the Olam app/proxy/catalog paths, push the intended lineage to `origin/main`, and deploy the exact pushed SHA through the repository's canonical production release scripts.
