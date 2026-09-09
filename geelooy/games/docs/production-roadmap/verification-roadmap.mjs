// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verification-roadmap.mjs
 * @description Records the evidence required before Awtsmoos Games work can be called production-ready.
 * This file treats tests, browser interaction, source discipline, deployment identity, and failure injection as one release system.
 *
 * Verification invariants:
 * - A page loading is not proof that its game works; automation must perform meaningful gameplay actions.
 * - A local pass is not proof of production; deployed artifacts must be tied back to the verified commit.
 * - Rare lifecycle races are expected failures at extreme scale and therefore belong in ordinary test matrices.
 * - Release evidence must remain reproducible enough that another agent can independently confirm the claim.
 */

/**
 * Verification, chaos, performance, and release work that remains part of the definition of done.
 * @type {readonly string[]}
 */
export const verificationRoadmap = Object.freeze([
	'Run syntax checks and the real CompactJS compiler for every changed live entry graph.',
	'Run source-law checks for line limits, readable formatting, tab indentation, architectural JSDoc, and debug leakage.',
	'Run actual gameplay probes that launch, perform a legal action, pause, resume, terminate, and retry.',
	'Run portrait, short-landscape, tablet, desktop, browser-zoom, and orientation-change viewport probes.',
	'Capture console exceptions, unhandled rejections, failed requests, bad responses, overflow, and offscreen controls.',
	'Stress restart generations repeatedly and verify listener, timer, RAF, Worker, AudioContext, and memory counts stabilize.',
	'Inject pointer cancellation, visibility changes, resize, rotation, repeated buttons, and backgrounding at lifecycle boundaries.',
	'Inject corrupted storage, storage exceptions, unavailable IndexedDB, and future-schema persistence envelopes.',
	'Inject Worker startup failure, Worker crash, stale Worker response, and generation replacement.',
	'Inject WebGL context loss or renderer failure and verify degraded or recoverable behavior instead of a permanent blank canvas.',
	'Inject offline transitions and network failures into optional services without blocking local gameplay.',
	'Fuzz result messages with stale run IDs, wrong turns, wrong paths, malformed numbers, duplicates, and impossible values.',
	'Fuzz semantic input with rapid taps, drags, multiple pointers, pointercancel, blur, held keys, and controller disconnect.',
	'Add property-based invariant tests for nonnegative health, finite currency, immutable results, and pause preventing simulation advance.',
	'Collect launch latency, readiness latency, frame-time percentiles, long tasks, renderer degradation, and restart growth indicators.',
	'Create a machine-readable Games health report that summarizes every production title and every release gate.',
	'Require Production status to have recent evidence for syntax, compact compile, source law, crawl, gameplay, retry, and result behavior.',
	'Fetch origin safely before commits and pushes, inspect divergence, and never overwrite unrelated concurrent work to manufacture cleanliness.',
	'Stage and commit only task-specific paths after inspecting the complete staged diff and source-line law.',
	'Reconcile origin/main only when overlapping dirty work cannot be damaged; otherwise continue isolated verified slices and report the blocker.',
	'After push, verify fresh-cache public Games routes, representative gameplay, asset requests, and served build identity.',
	'Create canary and rollback mechanisms so a newly broken game can be disabled or reverted without taking the catalog offline.',
	'Create synthetic production probes for catalog readiness and representative title launch at a reasonable monitoring cadence.',
	'Keep evidence receipts small, structured, timestamped, and associated with the exact game version and commit SHA.',
	'Never declare the project complete while any Production title lacks current real-gameplay verification.'
]);
