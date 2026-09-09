// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gameplay-roadmap.mjs
 * @description Records product, UX, accessibility, and game-design requirements that apply across Awtsmoos Games.
 * The roadmap intentionally treats the first seconds, core loop, failure state, recovery path, and replay loop as one product.
 *
 * Product invariants:
 * - Required mechanics must be discoverable without secret gestures or external instructions.
 * - Mobile layouts are designed intentionally instead of shrinking a desktop control wall.
 * - Visual polish never outranks input latency, simulation truth, readability, or recovery.
 * - Each title should expose a clear purpose, meaningful decisions, progression, terminal state, and useful retry path.
 */

/**
 * Cross-title gameplay and experience work that should guide every production pass.
 * @type {readonly string[]}
 */
export const gameplayRoadmap = Object.freeze([
	'Review the first ten seconds of every game for objective clarity, immediate agency, and zero unnecessary dead time.',
	'Review the final ten seconds for clear terminal cause, frozen score, useful summary, Retry, and no zombie simulation.',
	'Replace permanent mobile sidebars with compact HUDs, contextual sheets, radial choices, or battlefield-local actions.',
	'Guarantee 44–48 pixel minimum interactive targets and intentional safe-area spacing.',
	'Design portrait and short-landscape layouts independently where their information hierarchy differs.',
	'Preserve meaningful run state across orientation changes and ordinary browser chrome resizing.',
	'Expose visible cooldown, affordability, availability, maximum-upgrade, and disabled-state truth before an action is attempted.',
	'Provide one-handed and left-handed arrangements where touch gameplay benefits from them.',
	'Give every first-run tutorial a skip path and every returning player a way to replay it from Help.',
	'Keep keyboard shortcuts from stealing input while the user is typing in editable controls.',
	'Pair audio-only critical feedback with visible feedback and color-only information with another cue.',
	'Provide reduced-motion and reduced-flash alternatives without weakening the underlying rules of play.',
	'Keep HUDs focused on immediate danger, objective, key resource, and next action; move deep stats behind disclosure.',
	'Create explicit victory or mastery loops where endless survival would otherwise be the accidental default.',
	'Create difficulty presets with real mechanical differences and document their scoring implications.',
	'Create seedable randomness for strategy, procedural, puzzle, and challenge modes that benefit from reproducibility.',
	'Create readable boss and elite telegraphs rather than relying on surprise damage or unexplained durability.',
	'Create bounded spawn pacing and entity ceilings so difficulty cannot become uncontrolled device overload.',
	'Create progression systems that add choice without making casual local play dependent on accounts or remote services.',
	'Create contextual explanations for unfamiliar resources, upgrade branches, status effects, and targeting rules.',
	'Create consistent result summaries with score, wave or level, best comparison, outcome, retry, and mode change.',
	'Create deterministic pause behavior that freezes gameplay timers, spawns, AI, physics, and score-sensitive clocks.',
	'Create proper Resume semantics; never show Resume unless the runtime can actually reconstruct meaningful progress.',
	'Create graceful malformed-save recovery with an explicit start-fresh path instead of a blank or permanently loading game.',
	'Create actual tested gamepad support before claiming it in the catalog, settings, or help text.',
	'Create scalable localization seams for English and Hebrew, including RTL layout and Unicode-safe gameplay text.',
	'Create data-driven definitions for enemies, towers, levels, waves, items, achievements, and progression where practical.',
	'Preserve theme individuality while standardizing interaction patterns, accessibility behavior, lifecycle, and recovery.',
	'Treat fun, responsiveness, clarity, replayability, accessibility, and failure recovery as equally real production requirements.'
]);
