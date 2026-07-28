// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./liveDeviceIdentity.js");

/**
	* @file Separates authoritative routes from bounded historical shadows.
	* @description
	* The Awtsmoos reveals living authority without erasing finite history.
	* Awtsmoos.com keeps all live aliases, one freshest offline fallback, and moves
	* every superseded dead witness into an explicitly historical collection.
	*/
function partition(devices = [], historyLimit = 20) {
	const current = [];
	const historical = [];
	for (const group of groupByAlias(devices).values()) {
		const ordered = [...group].sort(compareFreshest);
		const live = ordered.filter(isRoutable);
		if (live.length) {
			current.push(...live);
			historical.push(...ordered.filter(device => !isRoutable(device)));
			continue;
		}
		if (ordered.length) current.push(ordered[0]);
		historical.push(...ordered.slice(1));
	}
	return {
		current: current.sort(compareFreshest),
		historical: historical.sort(compareFreshest).slice(0, bounded(historyLimit)),
		hiddenCount: Math.max(0, historical.length - bounded(historyLimit)),
		totalHistorical: historical.length
	};
}

function groupByAlias(devices = []) {
	const groups = new Map();
	for (const device of devices || []) {
		const key = String(device.tunnelName || device.deviceId || device.tunnelId || "");
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(device);
	}
	return groups;
}

function isRoutable(device = {}) {
	return device.isAlive === true &&
		device.connected !== false &&
		Boolean(device.routeReference || device.tunnelId);
}

function compareFreshest(left, right) {
	return Identity.freshestStamp(right) - Identity.freshestStamp(left);
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.floor(number))) : 20;
}

module.exports = { compareFreshest, groupByAlias, isRoutable, partition };
