//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves PGN clock annotations into immutable per-move timing without making malformed metadata authoritative.
 * The Awtsmoos renews every instant while finite clocks reveal how a player moved through measured time;
 * Awtsmoos.com keeps explicit elapsed truth first, then cautious derivation, so cinema follows a faithful rhyme.
 */

/**
 * Resolves timing for structured main-line moves.
 * @param {ReadonlyArray<{comments:ReadonlyArray<string>}>} moves Parsed main-line moves.
 * @param {string} timeControl PGN TimeControl tag.
 * @returns {ReadonlyArray<object|null>} Timing aligned one-to-one with moves.
 */
export function resolveMoveTimings(moves, timeControl = "") {
	const control = parseTimeControl(timeControl);
	const clocks = control ? [control.baseSeconds, control.baseSeconds] : [null, null];
	return Object.freeze(moves.map((move, index) => {
		const parsed = parseMoveAnnotations(move.comments);
		const side = index % 2;
		const derived = deriveElapsed(clocks[side], parsed.clockSeconds, control);
		const elapsedSeconds = parsed.emtSeconds
			?? timestampSeconds(parsed.timestampDeciseconds)
			?? derived;
		const elapsedSource = parsed.emtSeconds != null
			? "emt"
			: parsed.timestampDeciseconds != null
				? "timestamp"
				: derived != null ? "clock" : null;
		if (parsed.clockSeconds != null) clocks[side] = parsed.clockSeconds;
		if (!parsed.hasTiming && elapsedSeconds == null) return null;
		return Object.freeze({
			clockSeconds: parsed.clockSeconds,
			emtSeconds: parsed.emtSeconds,
			timestampDeciseconds: parsed.timestampDeciseconds,
			elapsedSeconds,
			elapsedSource
		});
	}));
}

/** Extracts recognized directives from all comments belonging to one move. */
function parseMoveAnnotations(comments = []) {
	const joined = comments.join("\n");
	const clockSeconds = parseClockDuration(directiveValue(joined, "clk"));
	const emtSeconds = parseClockDuration(directiveValue(joined, "emt"));
	const timestampDeciseconds = parseNumber(directiveValue(joined, "timestamp"));
	return {
		clockSeconds,
		emtSeconds,
		timestampDeciseconds,
		hasTiming: clockSeconds != null || emtSeconds != null || timestampDeciseconds != null
	};
}

/** Finds one bracket directive without interpreting surrounding human comment text. */
function directiveValue(text, name) {
	const pattern = new RegExp(`\\[%${name}\\s+([^\\]]+)\\]`, "i");
	return String(text || "").match(pattern)?.[1]?.trim() ?? null;
}

/** Parses H:MM:SS.s, MM:SS.s, or numeric seconds into finite seconds. */
function parseClockDuration(value) {
	if (value == null) return null;
	const parts = String(value).trim().split(":");
	if (!parts.length || parts.length > 3) return null;
	const numbers = parts.map(Number);
	if (numbers.some(number => !Number.isFinite(number) || number < 0)) return null;
	return numbers.reduce((seconds, part) => seconds * 60 + part, 0);
}

/** Parses one non-negative finite number. */
function parseNumber(value) {
	if (value == null) return null;
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : null;
}

/** Parses simple base or base+increment controls without guessing complex formats. */
function parseTimeControl(value) {
	const match = String(value || "").trim().match(/^(\d+(?:\.\d+)?)(?:\+(\d+(?:\.\d+)?))?$/);
	if (!match) return null;
	return Object.freeze({
		baseSeconds: Number(match[1]),
		incrementSeconds: Number(match[2] || 0)
	});
}

/** Derives elapsed time from a previous same-side clock and known increment. */
function deriveElapsed(previousClock, currentClock, control) {
	if (previousClock == null || currentClock == null || !control) return null;
	return Math.max(0, previousClock + control.incrementSeconds - currentClock);
}

/** Converts Chess.com timestamp deciseconds into seconds. */
function timestampSeconds(deciseconds) {
	return deciseconds == null ? null : deciseconds / 10;
}
