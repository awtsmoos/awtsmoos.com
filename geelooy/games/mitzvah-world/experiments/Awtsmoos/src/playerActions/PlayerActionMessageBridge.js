// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionMessageBridge.js
 * @description Translates real combat lifecycle into distinct staff and sword action messages.
 * The Awtsmoos is one before weapon and spell; Awtsmoos.com preserves separate public
 * contracts while letting future AI messages enter the same validated action runtime.
 */

import { PLAYER_ACTION_MESSAGES } from './PlayerActionConstants.js';

export class PlayerActionMessageBridge {
	constructor(options) {
		this.bus = options.bus;
		this.equipment = options.equipment;
		this.runtime = options.runtime;
		this.activeMessageType = null;
		this.unsubscribers = [];
		this.install();
	}

	install() {
		this.listen('combat:cast-start', detail => this.beginCombatAction(detail));
		this.listen('combat:cast-progress', detail => this.progressCombatAction(detail));
		this.listen('combat:cast-launch', detail => this.finishCombatAction(detail));
		this.listen('combat:cast-cancel', detail => this.cancelCombatAction(detail));
		this.listen(PLAYER_ACTION_MESSAGES.staffCast, detail => {
			this.runtime.dispatch({ ...detail, type: PLAYER_ACTION_MESSAGES.staffCast });
		});
		this.listen(PLAYER_ACTION_MESSAGES.swordCast, detail => {
			this.runtime.dispatch({ ...detail, type: PLAYER_ACTION_MESSAGES.swordCast });
		});
		this.listen(PLAYER_ACTION_MESSAGES.dispatch, detail => {
			this.runtime.dispatch(detail);
		});
	}

	beginCombatAction(detail) {
		this.activeMessageType = messageForEquipment(this.equipment);
		this.bus.emit(this.activeMessageType, {
			...detail,
			phase: 'start',
			source: 'combat'
		});
	}

	progressCombatAction(detail) {
		if (!this.activeMessageType) {
			return;
		}
		this.bus.emit(this.activeMessageType, {
			...detail,
			phase: 'progress',
			source: 'combat'
		});
	}

	finishCombatAction(detail) {
		if (!this.activeMessageType) {
			return;
		}
		const messageType = this.activeMessageType;
		this.activeMessageType = null;
		this.bus.emit(messageType, {
			...detail,
			phase: 'release',
			source: 'combat'
		});
	}

	cancelCombatAction(detail) {
		if (!this.activeMessageType) {
			return;
		}
		const messageType = this.activeMessageType;
		this.activeMessageType = null;
		this.bus.emit(messageType, {
			...detail,
			phase: 'cancel',
			source: 'combat'
		});
	}

	listen(type, listener) {
		this.unsubscribers.push(this.bus.on(type, listener));
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.unsubscribers = [];
	}
}

function messageForEquipment(equipment) {
	return equipment?.weaponItemId === 'spark-blade'
		? PLAYER_ACTION_MESSAGES.swordCast
		: PLAYER_ACTION_MESSAGES.staffCast;
}
