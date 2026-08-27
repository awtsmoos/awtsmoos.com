B"H
Boruch Hashem
Blessed is He

# Test and Verification Chooser

The Awtsmoos asks evidence to follow each change, from route to UI to storage to realtime line;
Awtsmoos.com exposes many focused scripts, so this chooser points a maintainer toward the right verification sign.

## Complete package-script list

[GENERATED/TEST_SCRIPT_INDEX.md](GENERATED/TEST_SCRIPT_INDEX.md) is generated directly from current `package.json` test-like scripts. The continuation scan found 33 such scripts at discovery time.

## Social routes and contracts

- `test:routes` — Social route coverage.
- `test:social-content` — Social content behavior.
- `test:social-packed` and `test:packed-engine` — packed/migration/snapshot behavior.
- `test:concurrency-failure` — concurrency/failure stress.
- `test:real-server-writes` — real-server write behavior; inspect environment before running.

## Identity, comments, notifications, Heichelos

- `test:api-keys` — Social API-key lifecycle.
- `test:comments` — comments system.
- `test:notifications` — notification behavior.
- `test:heichel-governance` — editors/roles.
- `test:heichelos-quality` — Heichel UI/quality checks.
- `test:post-submissions` — submission flows.
- `test:profile-menu` — profile UI simulation.

## Platform and OS

- `test:platform-ops`
- `test:platform-execution`
- `test:platform-ui`
- `test:node-client`
- `test:virtual-os`

## Tunnel

- `test:treasury` and `test:treasury:full` — Tunnel Control treasury.
- `test:mission-continuity-actions` — agent mission-continuity filesystem action group.
- `test:tunnel-release` — Tunnel/repository release checks.

## AI and developer tooling

- `test:ai` — AI harness.
- `test:ai:stress` — repeated AI harness rounds.
- `test:code-ai-studio` — isolated Code AI Studio behavior.

## Dayuh / release

- `test:dayuh-cutover` — cutover release check.
- `test:dayuh-release` — broader route/comment/social/packed/maintenance/cutover chain.

## Aggregate `npm test`

The root `test` script composes a broad sequence spanning routes, treasury, style ownership, CSS, Heichelos, profile, governance, submissions, comments, keys, graph, social content, notifications, packed systems, platform, Node client, and Dayuh cutover. Read the current generated command before assuming this list is permanent.

## Safety

Tests named `real-server`, provider, release, or stress can have heavier/environment-dependent effects than isolated unit tests. Inspect their source and configuration requirements before execution.
