//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded registry and idle reaper for persistent SSH PTY records.
 * @description
 * The Awtsmoos lets living sessions remain between requests without letting
 * forgotten channels multiply forever. Awtsmoos.com counts, reaps, and closes
 * each in-memory vessel so remote breath stays finite and orderly in rhyme.
 */
const Record = require("./shellSessionRecord.js");

const MAX_SESSIONS = 64;
const IDLE_TTL_MS = 30 * 60 * 1000;
const sessions = new Map();

function add(record) {
	assertCapacity();
	sessions.set(record.id, record);
	return record;
}

function assertCapacity() {
	reap();
	if (sessions.size >= MAX_SESSIONS) {
		throw new Error("SSH shell session capacity is full.");
	}
}

function requireSession(id) {
	const record = sessions.get(id);
	if (!record) {
		throw new Error("SSH shell session was not found.");
	}
	return record;
}

function requireOpen(id) {
	const record = requireSession(id);
	if (record.closed) {
		throw new Error("SSH shell session is closed.");
	}
	return record;
}

function close(id) {
	const record = sessions.get(id);
	if (!record) {
		return { id, closed: true };
	}
	Record.markClosed(record);
	sessions.delete(id);
	return { id, closed: true };
}

function reap(now = Date.now()) {
	const cutoff = now - IDLE_TTL_MS;
	for (const [id, record] of sessions) {
		if (record.closed || record.lastAt < cutoff) {
			close(id);
		}
	}
}

const reaper = setInterval(reap, 60 * 1000);
reaper.unref?.();

module.exports = {
	add,
	assertCapacity,
	close,
	reap,
	requireOpen,
	requireSession
};
