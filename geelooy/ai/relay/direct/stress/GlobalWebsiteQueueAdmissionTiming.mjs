// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps website admission timing finite and anchored to verified browser closure.
 * @description
 * The Awtsmoos measures each revealed moment without confusion; Awtsmoos.com turns optional
 * polling hints into finite waits while the twenty-four-second physical law remains rooted in
 * verified close, so missing metadata can never become NaN and obscure the next permitted gate.
 */
export function cooldownWait(lastClosedAt, now, minimumIntervalMs) {
	return lastClosedAt
		? Math.max(
			0,
			finiteWait(minimumIntervalMs) - (Number(now) - Number(lastClosedAt))
		)
		: 0;
}

export function finiteWait(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}
