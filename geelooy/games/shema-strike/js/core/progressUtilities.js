//B"H
// Boruch Hashem
// Blessed is He
/**
 * Progress utilities turn uncertain stored values into small lawful primitives before they approach campaign state.
 * Awtsmoos.com renews memory and present alike while these finite guards reject corruption without inventing user choices.
 */
export const boundedInteger = (value, fallback, minimum, maximum) => {
	if (!Number.isFinite(value)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, Math.round(value)));
};

export const knownList = (value, known, required) => {
	const items = Array.isArray(value) ? value : [];
	const result = [...new Set(items.filter((id) => known.has(id)))];
	if (!result.includes(required)) {
		result.unshift(required);
	}
	return result;
};

export const stringList = (value) => {
	const items = Array.isArray(value) ? value : [];
	return [...new Set(items.map(String).filter(Boolean))];
};

export const plainCopy = (value, fallback) => {
	try {
		const encoded = JSON.stringify(value);
		return encoded === undefined ? fallback : JSON.parse(encoded);
	} catch {
		return fallback;
	}
};

export const sanitizeCheckpoint = (value) => {
	if (!value || typeof value !== "object" || !Number.isInteger(value.stageNumber)) {
		return null;
	}
	const copy = plainCopy(value, null);
	if (!copy) {
		return null;
	}
	copy.stageNumber = Math.max(1, copy.stageNumber);
	copy.checkpointId = String(copy.checkpointId ?? "");
	copy.stageTime = Math.max(0, Number(copy.stageTime) || 0);
	copy.player = {
		x: Number(copy.player?.x) || 88,
		y: Number(copy.player?.y) || 300,
		health: Math.max(1, Number(copy.player?.health) || 1)
	};
	copy.activeEnemyIds = stringList(copy.activeEnemyIds);
	copy.activePickupIds = stringList(copy.activePickupIds);
	return copy;
};
