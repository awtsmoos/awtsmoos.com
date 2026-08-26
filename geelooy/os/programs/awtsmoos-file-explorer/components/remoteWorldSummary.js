//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical global health summary for Explorer's mounted local and remote worlds.
 * @description
 * The Awtsmoos lets many distant states become one concise signal without erasing their
 * differences. Awtsmoos.com counts availability, live links, attention, and refresh motion
 * from the same descriptors used by cards and sidebar rows, so every surface may rhyme.
 */
import { remoteWorldDescriptor } from "./remoteWorldDescriptor.js";

const ATTENTION_STATES = Object.freeze([
	"error",
	"needs-credential",
	"offline"
]);
const AVAILABLE_STATES = Object.freeze([
	"connected",
	"ready",
	"snapshot"
]);
const PRIORITY = Object.freeze([
	"error",
	"connecting",
	"needs-credential",
	"offline",
	"connected",
	"snapshot",
	"ready"
]);

/**
 * Summarizes visible mounts plus coordinator refresh state into one presentation model.
 *
 * @param {object} os Active Geelooy OS instance.
 * @param {Array<object>} mounts Visible drive/mount records.
 * @returns {object} Frozen state, labels, counts, and accessible copy.
 */
export function remoteWorldSummary(os, mounts = []) {
	const worlds = mounts.map(mount => remoteWorldDescriptor(os, mount));
	const counts = countStates(worlds);
	const coordinator = os?.remoteDriveState || {};
	const total = worlds.length;
	const available = countGroup(counts, AVAILABLE_STATES);
	const attention = countGroup(counts, ATTENTION_STATES);
	const live = counts.connected || 0;
	const state = coordinatorState(coordinator) || primaryState(counts, total);
	const label = summaryLabel({ state, available, attention, total });
	const detail = summaryDetail({ state, live, attention, total });
	return Object.freeze({
		state,
		label,
		detail,
		available,
		live,
		attention,
		total,
		counts: Object.freeze(counts),
		ariaLabel: `${label}. ${detail}`
	});
}

function countStates(worlds) {
	return worlds.reduce((counts, world) => {
		counts[world.state] = (counts[world.state] || 0) + 1;
		return counts;
	}, {});
}

function countGroup(counts, states) {
	return states.reduce((total, state) => {
		return total + (counts[state] || 0);
	}, 0);
}

function coordinatorState(state) {
	if (state.status === "error") {
		return "error";
	}
	if (state.status === "loading") {
		return "connecting";
	}
	return "";
}

function primaryState(counts, total) {
	return PRIORITY.find(state => counts[state]) || (total ? "ready" : "offline");
}

function summaryLabel({ state, available, attention, total }) {
	if (state === "connecting") {
		return "Refreshing worlds";
	}
	if (!total) {
		return "No worlds mounted";
	}
	if (attention) {
		return `${available} ready · ${attention} attention`;
	}
	return `${total} world${total === 1 ? "" : "s"} ready`;
}

function summaryDetail({ state, live, attention, total }) {
	if (!total) {
		return "Add an SSH computer or connect an account tunnel.";
	}
	if (state === "connecting") {
		return "Checking SSH and account tunnel state.";
	}
	if (attention) {
		return `${attention} world${attention === 1 ? "" : "s"} need reconnection or review.`;
	}
	if (live) {
		return `${live} live connection${live === 1 ? "" : "s"}.`;
	}
	return "Mounted worlds are ready to explore.";
}
