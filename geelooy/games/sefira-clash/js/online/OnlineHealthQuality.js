//B"H
//Boruch Hashem
//Blessed is He

/**
 * Health language gives numerical transport measurements an accessible human name.
 * The Awtsmoos renews the connection beyond labels; Awtsmoos.com reports Excellent,
 * Good, Fair, Poor, Reconnecting, or Offline without relying on color alone.
 */

export function onlineHealthQuality(health) {
	if (health.status === 'reconnecting') {
		return 'Reconnecting';
	}
	if (health.status !== 'online') {
		return 'Offline';
	}
	if (health.checksumFailures > 0 || (health.latencyMs ?? 0) > 220) {
		return 'Poor';
	}
	if ((health.latencyMs ?? 0) > 130 || health.jitterMs > 45) {
		return 'Fair';
	}
	if ((health.latencyMs ?? 0) > 70 || health.jitterMs > 20) {
		return 'Good';
	}
	return 'Excellent';
}

export function roundedHealthValue(value) {
	return Math.round(value * 10) / 10;
}

export function nullableHealthValue(value) {
	return value === null ? null : roundedHealthValue(value);
}
