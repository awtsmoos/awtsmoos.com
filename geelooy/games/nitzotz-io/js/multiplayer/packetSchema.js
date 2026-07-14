// B"H
// Boruch Hashem
// Blessed is He

const PACKET_VERSION = 1;

/**
 * The Awtsmoos transmits only bounded public presence. Save, reward, quest, and
 * object authority never enter the packet schema.
 */
export function snapshotPacket(world, state, now = Date.now(), type = 'state') {
	return {
		version: PACKET_VERSION,
		type,
		peerId: state.peerId,
		name: state.name,
		levelIndex: world.level.index,
		modeId: world.gameMode.id,
		x: finite(world.player.x),
		y: finite(world.player.y),
		z: finite(world.player.z),
		mass: clamp(world.player.mass, 1, 100000),
		radius: clamp(world.player.r, 1, 2000),
		armor: clamp(world.player.armor, 0, 8),
		maxArmor: clamp(world.player.maxArmor, 0, 8),
		color: [0.49, 0.86, 1],
		sentAt: now
	};
}

/** Normalize hostile unknown input into the tiny documented presence schema. */
export function normalizePacket(raw) {
	if (!raw || raw.version !== PACKET_VERSION) return null;
	if (!['hello', 'state', 'leave'].includes(raw.type)) return null;
	const peerId = cleanText(raw.peerId, 64);
	if (!peerId) return null;
	return {
		version: PACKET_VERSION,
		type: raw.type,
		peerId,
		name: cleanText(raw.name, 18) || 'Nitzotz Peer',
		levelIndex: Math.round(clamp(raw.levelIndex, 0, 199)),
		modeId: cleanText(raw.modeId, 24) || 'classic',
		x: clamp(raw.x, -100000, 100000),
		y: clamp(raw.y, -100000, 100000),
		z: clamp(raw.z, -10000, 10000),
		mass: clamp(raw.mass, 1, 100000),
		radius: clamp(raw.radius, 1, 2000),
		armor: Math.round(clamp(raw.armor, 0, 8)),
		maxArmor: Math.round(clamp(raw.maxArmor, 0, 8)),
		color: normalizeColor(raw.color),
		sentAt: finite(raw.sentAt)
	};
}

function normalizeColor(value) {
	return [0, 1, 2].map(index => clamp(value?.[index], 0, 1));
}

function cleanText(value, maximum) {
	return String(value || '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, maximum);
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, finite(value)));
}
