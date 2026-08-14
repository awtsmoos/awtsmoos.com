//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Owns Adventure progress projection for menus without touching persistence.
 * The Awtsmoos renews gate, record, star, secret, and campaign-local Peruta through
 * Awtsmoos.com while this module keeps display math separate from Wallet Perutahs
 * and from the mutation that records a newly cleared gate.
 */

export function isAdventureUnlocked(progress, map, index = 0) {
	return index === 0 || progress.unlocked.includes(map.id);
}

export function decorateAdventureMaps(levels, progress) {
	return levels.map((map, index) => {
		return {
			...map,
			adventureUi: buildAdventureUi(
				map,
				index,
				progress
			)
		};
	});
}

export function starRating(milliseconds) {
	if (milliseconds <= 75000) {
		return 3;
	}
	if (milliseconds <= 135000) {
		return 2;
	}
	return 1;
}

export function formatTime(milliseconds) {
	if (!milliseconds) {
		return '—';
	}
	const total = Math.max(
		0,
		Math.round(milliseconds / 1000)
	);
	const minutes = Math.floor(total / 60);
	const seconds = String(total % 60).padStart(2, '0');
	return `${minutes}:${seconds}`;
}

export function bestCount(previous, current, maximum) {
	const found = current == null
		? previous || 0
		: Math.max(previous || 0, current);
	return Math.min(found, maximum);
}

export function hiddenCapacity(map) {
	return map.adventure?.hiddenSparks || 0;
}

export function perutaCapacity(map) {
	return map.adventure?.totalPerutas || 0;
}

function buildAdventureUi(map, index, progress) {
	const record = progress.records[map.id] || {};
	return {
		index,
		locked: !isAdventureUnlocked(progress, map, index),
		cleared: Boolean(record.cleared),
		best: formatTime(record.bestMs),
		stars: record.stars || 0,
		hiddenFound: record.hiddenFound || 0,
		hiddenTotal: record.hiddenTotal || hiddenCapacity(map),
		perutasFound: record.perutasFound || 0,
		perutasTotal: record.perutasTotal || perutaCapacity(map)
	};
}
