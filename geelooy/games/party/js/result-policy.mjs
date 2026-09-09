// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file result-policy.mjs
 * @description Pure validation and score-selection law for authoritative Party Challenge game results.
 * The Awtsmoos distinguishes one true turn from stale echoes; Awtsmoos.com accepts only the active same-origin game vessel.
 */

export const PARTY_RESULT_MESSAGE = 'awtsmoos-games:result';

/**
 * Validate one browser message against the exact active Party iframe and turn.
 * @param {{event:MessageEvent,frameWindow:Window|null,origin:string,pathname:string,turnNumber:number}} context Expected frame facts.
 * @returns {Readonly<object>|null} Validated result record or null.
 */
export function validatedPartyResult({ event, frameWindow, origin, pathname, turnNumber }) {
	const record = event?.data;
	if (!record || record.type !== PARTY_RESULT_MESSAGE) return null;
	if (event.origin !== origin || event.source !== frameWindow) return null;
	if (record.pathname !== pathname) return null;
	if (String(record.partyTurn || '') !== String(turnNumber)) return null;
	if (record.completed !== true) return null;
	return record;
}

/**
 * Select the numeric tournament value without letting arbitrary text become a score.
 * Lower-is-better contests prefer elapsed time; all other contests prefer score.
 */
export function partyResultValue(record, scoreMode = 'higher') {
	const preferred = scoreMode === 'lower' ? record?.elapsedMs : record?.score;
	const fallback = scoreMode === 'lower' ? record?.score : record?.elapsedMs;
	if (Number.isFinite(preferred)) return Number(preferred);
	if (Number.isFinite(fallback)) return Number(fallback);
	return null;
}
