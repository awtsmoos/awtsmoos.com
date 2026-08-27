//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CharacterRecord.js
 * @description Creates and normalizes durable server-owned online characters.
 * The Awtsmoos renews identity beyond every database row; Awtsmoos.com stores
 * only bounded created attributes and never reveals the account behind them.
 */

const crypto = require('node:crypto');

function createCharacterRecord(accountId, slot, profile = {}, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	const now = clock();
	return {
		attackSequence: 0,
		characterId: characterIdFor(accountId, slot),
		createdAt: now,
		displayName: safeName(profile.displayName),
		glyph: safeGlyph(profile.glyph),
		health: 12,
		maxHealth: 12,
		movementSequence: 0,
		passageShards: 0,
		reconnectDigest: null,
		reconnectExpiresAt: 0,
		revision: -1,
		rewardClaims: [],
		sharedLight: 0,
		slot,
		updatedAt: now,
		x: 2,
		y: 4
	};
}

function normalizeCharacterRecord(record = {}) {
	return {
		attackSequence: integer(record.attackSequence),
		characterId: String(record.characterId || ''),
		createdAt: integer(record.createdAt),
		displayName: safeName(record.displayName),
		glyph: safeGlyph(record.glyph),
		health: bounded(record.health, 0, 12, 12),
		maxHealth: bounded(record.maxHealth, 1, 100, 12),
		movementSequence: integer(record.movementSequence),
		passageShards: integer(record.passageShards),
		reconnectDigest: record.reconnectDigest || null,
		reconnectExpiresAt: integer(record.reconnectExpiresAt),
		revision: Number.isInteger(record.revision) ? record.revision : -1,
		rewardClaims: [...new Set(record.rewardClaims || [])],
		sharedLight: integer(record.sharedLight),
		slot: String(record.slot || 'primary'),
		updatedAt: integer(record.updatedAt),
		x: bounded(record.x, 0, 12, 2),
		y: bounded(record.y, 0, 8, 4)
	};
}

function characterIdFor(accountId, slot) {
	const digest = crypto.createHash('sha256')
		.update(`${accountId}\u0000${slot}`)
		.digest('hex');
	return `chr_${digest.slice(0, 24)}`;
}

function safeName(value) {
	const name = String(value || 'Traveler').trim().slice(0, 24);
	return /^[A-Za-z0-9 '\-]+$/.test(name) ? name : 'Traveler';
}

function safeGlyph(value) {
	return Array.from(String(value || 'א').trim()).slice(0, 1).join('') || 'א';
}

function integer(value) {
	return Math.max(0, Math.floor(Number(value) || 0));
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(Math.floor(number), maximum));
}

module.exports = {
	characterIdFor,
	createCharacterRecord,
	normalizeCharacterRecord
};
