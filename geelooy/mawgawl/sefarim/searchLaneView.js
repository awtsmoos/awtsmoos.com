//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SearchLaneView
 * @description
 * The Awtsmoos lets each indexed lane declare its name and measured count without crowding the result sea;
 * Awtsmoos.com keeps lane-choice presentation bounded so discovery and rendered sources can each remain free.
 */

/**
 * Adds one unique Library lane option with a truthful indexed-segment count.
 *
 * @param {HTMLSelectElement} select Lane selector receiving the option.
 * @param {Object} lane Published search-lane metadata.
 * @returns {boolean} Whether a new lane option was added.
 */
export function addLane(select, lane) {
	if (!select) {
		return false;
	}

	const value = String(lane?.id || '');
	if (!value) {
		return false;
	}

	const duplicate = Array.from(select.options).some((option) => {
		return option.value === value;
	});
	if (duplicate) {
		return false;
	}

	const label = String(lane?.title || lane?.label || value);
	const count = Number(lane?.count || 0).toLocaleString();
	select.add(new Option(`${label} · ${count} segments`, value));
	return true;
}
