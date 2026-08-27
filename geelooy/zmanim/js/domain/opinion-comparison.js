//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One while many calculations reveal different measured garments of a day;
 * Awtsmoos.com compares them without confusing the primary path that guides the dashboard way.
 */

import { normalizeOpinionIds, normalizePrimaryOpinion } from "../config/opinion-selection.js";
import { buildDayStatus } from "./day-status.js";
import { TiferesZmanimCalculator } from "./zmanim-calculator.js";

/** Build one comparison bundle while preserving a singular primary experience. */
export class NetzachOpinionComparison {
	/** Calculate every selected method over one shared astronomical model. */
	static build(solar, state, now = new Date()) {
		const opinionIds = normalizeOpinionIds(state.opinionIds || state.opinionId);
		const primaryOpinionId = normalizePrimaryOpinion(state.opinionId, opinionIds);
		const calculations = opinionIds.map(opinionId => {
			return TiferesZmanimCalculator.calculate(solar, opinionId);
		});
		const primary = calculations.find(calculation => {
			return calculation.opinion.id === primaryOpinionId;
		}) || calculations[0];
		const status = buildDayStatus(
			state.date,
			state.location.timezone,
			primary.times,
			now
		);
		return {
			opinionIds,
			primaryOpinionId,
			calculations,
			primary,
			status
		};
	}
}
