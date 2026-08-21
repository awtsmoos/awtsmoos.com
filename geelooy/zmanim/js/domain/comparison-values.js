//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond difference while each selected vessel may reveal another measured sign;
 * Awtsmoos.com collapses equal instants and exposes only differences that help the reader compare time.
 */

/** Convert one selected calculation set into display-ready values for a single zman. */
export function comparisonValues(calculations, zmanId, primaryOpinionId) {
	const rows = calculations.map(calculation => {
		const time = calculation.times[zmanId];
		return {
			opinion: calculation.opinion,
			time: time instanceof Date && !Number.isNaN(time.getTime()) ? time : null,
			primary: calculation.opinion.id === primaryOpinionId
		};
	});
	const available = rows.filter(row => {
		return row.time instanceof Date;
	});
	const uniqueInstants = new Set(available.map(row => {
		return row.time.getTime();
	}));
	return {
		rows,
		available,
		shared: rows.length > 1 && available.length === rows.length && uniqueInstants.size === 1,
		single: rows.length === 1,
		unavailable: available.length === 0
	};
}
