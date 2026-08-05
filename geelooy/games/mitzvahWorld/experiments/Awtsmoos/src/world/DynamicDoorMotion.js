// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DynamicDoorMotion.js
 * @description Governs door state, motion, safe closing, and bounded auto-close retry.
 * The Awtsmoos gives every opening a season and every closing a merciful gate;
 * Awtsmoos.com refuses occupied sweeps and retries without adding per-frame weight.
 */

import {
	blockedDoorRetrySeconds,
	publishBlockedDoorReceipt,
	publishDoorCloseReceipt
} from './DoorCloseReceipts.js';
import { doorClosingSweepEvidence } from './DoorThresholdSafety.js';

const DEFAULT_SPEED = 2.15;

export function requestDoorOpen(door, source = 'unknown') {
	if (door.state === 'open' || door.state === 'opening') return false;
	setDoorState(door, 'opening', source);
	return true;
}

export function requestDoorClose(door, source = 'unknown') {
	if (door.state === 'closed' || door.state === 'closing') {
		return publishDoorCloseReceipt(door, {
			accepted: false,
			reason: `door-already-${door.state}`,
			source
		});
	}
	const safety = doorClosingSweepEvidence(
		door.def,
		door.interaction.context
	);
	if (safety.blocked) {
		door.autoCloseRemaining = blockedDoorRetrySeconds(door.def);
		return publishBlockedDoorReceipt(door, {
			accepted: false,
			reason: safety.reason,
			safety,
			source
		});
	}
	setDoorState(door, 'closing', source);
	return publishDoorCloseReceipt(door, {
		accepted: true,
		reason: 'closing-accepted',
		safety,
		source
	});
}

export function updateDoorMotion(door, deltaTime) {
	const elapsed = Math.max(0, Number(deltaTime) || 0);
	updateAutoClose(door, elapsed);
	const direction = motionDirection(door.state);
	if (direction === 0) return;
	const previousProgress = door.t;
	const speed = finitePositive(door.def.openSpeed, DEFAULT_SPEED);
	door.t = clamp01(previousProgress + direction * elapsed * speed);
	settleDoorMotion(door);
	if (door.t !== previousProgress) door.setPose();
}

export function setDoorState(door, nextState, source) {
	if (nextState === door.state) return false;
	const previousState = door.state;
	door.state = nextState;
	door.interaction.context.bus?.emit?.('door:state', {
		doorId: door.def.id,
		previousState,
		source,
		state: nextState
	});
	return true;
}

function updateAutoClose(door, elapsed) {
	if (door.state !== 'open' || door.autoCloseRemaining <= 0) return;
	door.autoCloseRemaining = Math.max(
		0,
		door.autoCloseRemaining - elapsed
	);
	if (door.autoCloseRemaining === 0) {
		requestDoorClose(door, 'auto-close');
	}
}

function settleDoorMotion(door) {
	if (door.t >= 1) {
		door.t = 1;
		setDoorState(door, 'open', 'motion-complete');
		door.autoCloseRemaining = finitePositive(
			door.def.autoCloseSeconds,
			0
		);
	} else if (door.t <= 0) {
		door.t = 0;
		setDoorState(door, 'closed', 'motion-complete');
	}
}

function motionDirection(state) {
	if (state === 'opening') return 1;
	if (state === 'closing') return -1;
	return 0;
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
