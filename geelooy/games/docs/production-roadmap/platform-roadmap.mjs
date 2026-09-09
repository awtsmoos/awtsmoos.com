// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file platform-roadmap.mjs
 * @description Records the long-horizon production architecture expected of the Awtsmoos Games platform.
 * This module is documentation expressed as executable data so future agents can import, validate, diff,
 * search, and extend the roadmap without turning one prose file into another unbounded monolith.
 *
 * Architectural invariants:
 * - Every item describes a platform responsibility rather than a one-off cosmetic preference.
 * - Reliability work assumes failures, retries, weak devices, and concurrent lifecycle events are normal.
 * - Shared infrastructure must remain optional enough that one broken subsystem cannot blank local play.
 * - Future additions belong in focused sibling roadmap modules when this file approaches the source limit.
 */

/**
 * Platform-level production work that should remain visible until it is implemented and verified.
 * @type {readonly string[]}
 */
export const platformRoadmap = Object.freeze([
	'Adopt one lifecycle vocabulary: boot, ready, running, paused, backgrounded, completed, disposed.',
	'Give every run a generation token that invalidates stale async callbacks after retry or disposal.',
	'Centralize semantic input actions so pointer, keyboard, and tested gamepad paths produce identical intent.',
	'Make result records immutable after completion and validate score, time, outcome, mode, difficulty, and run identity.',
	'Publish machine-readable capability manifests and generate catalog claims from those manifests.',
	'Provide shared pause-reason ownership so manual pause, background suspension, modal pause, and system pause do not conflict.',
	'Provide versioned persistence envelopes with schema migration, validation, bounded storage, and corruption recovery.',
	'Provide a renderer health contract with DPR policy, context-loss handling, quality fallback, and explicit readiness.',
	'Provide Worker supervision with ready handshakes, protocol versions, generation IDs, timeouts, errors, and teardown.',
	'Provide bounded network retries with jitter, circuit breaking, offline detection, cancellation, and load shedding.',
	'Make audio and haptics optional adapters that can fail without blocking core gameplay.',
	'Classify effects as gameplay-critical, feedback, or ambience so quality governors degrade decoration first.',
	'Add weak-device budgets for entities, projectiles, particles, draw calls, DPR, catch-up ticks, and memory growth.',
	'Create a shared startup watchdog that distinguishes recoverable, degraded, and fatal boot states.',
	'Create a shared failure surface with Retry, Retry Low Quality, Restart Run, Clear Local Data, and Return to Games.',
	'Create an internal health snapshot for renderer, input, storage, workers, network, results, and lifecycle state.',
	'Create reusable focus ownership for dialogs, bottom sheets, game-over screens, and returning focus after dismissal.',
	'Create left-handed, touch-scale, reduced-motion, reduced-flash, high-contrast, audio, and haptics preferences.',
	'Create Party policies for score, elapsed time, survival time, win-loss, completion rank, teams, and aggregate modes.',
	'Create Party handoff privacy so a next player cannot accidentally inspect the prior player’s final tactical state.',
	'Create deterministic daily and Party challenge seeds where procedural fairness benefits from identical conditions.',
	'Create catalog freshness rules so Production status expires when a title has not passed current release gates.',
	'Create release metadata that binds verified commit SHA, compact artifacts, test receipts, and public deployment identity.',
	'Create emergency per-game disable and rollback paths so one broken title cannot take the entire catalog offline.',
	'Create privacy-conscious operational metrics for launch success, readiness latency, crash-free runs, completion, and retry.',
	'Create multi-agent subtree intent or lease signaling so overlapping edits are detected before destructive conflicts.',
	'Keep shared runtime itself modular; never replace many game monoliths with one giant shared-utils monolith.',
	'Prefer local-first gameplay and CDN-static delivery so absurd traffic does not translate into unnecessary server load.'
]);
