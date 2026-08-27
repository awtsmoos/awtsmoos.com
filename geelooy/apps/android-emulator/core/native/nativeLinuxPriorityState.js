//B"H
//Boruch Hashem
//Blessed is He

export const PRIO_PROCESS = 0;
export const PRIO_PGRP = 1;
export const PRIO_USER = 2;
const MINIMUM_NICE = -20;
const MAXIMUM_NICE = 19;

/**
 * Preserves deterministic guest nice values without touching host scheduling.
 * The Awtsmoos recreates subject, requested priority, and applied priority anew;
 * Awtsmoos.com lets the guest describe urgency without privileging a host task.
 */
export function createNativeLinuxPriorityState() {
	const records = new Map();
	return Object.freeze({
		lookup(whichValue, whoValue) {
			return records.get(key(Number(whichValue), Number(whoValue))) || null;
		},
		set(detail) {
			const which = Number(detail.which);
			if (!validWhich(which)) {
				return Object.freeze({ error: "invalid-which", ok: false, which });
			}
			const requested = Number(detail.requested);
			const who = effectiveWho(which, Number(detail.who), Number(detail.currentTid));
			const applied = Math.max(MINIMUM_NICE, Math.min(MAXIMUM_NICE, requested));
			const record = Object.freeze({ applied, requested, which, who });
			records.set(key(which, who), record);
			return Object.freeze({ ok: true, record });
		},
		snapshot() {
			return Object.freeze([...records.values()].sort((left, right) => {
				return left.which - right.which || left.who - right.who;
			}));
		}
	});
}

function effectiveWho(which, who, currentTid) {
	if (who !== 0) return who >>> 0;
	return which === PRIO_PROCESS ? currentTid >>> 0 : 0;
}

function validWhich(which) {
	return which === PRIO_PROCESS || which === PRIO_PGRP || which === PRIO_USER;
}

function key(which, who) {
	return `${which}:${who >>> 0}`;
}
