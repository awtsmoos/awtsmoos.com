// B"H

import * as BotSystem from '../botSystem.js';
import * as Combat from '../combat.js';
import * as World from '../world.js';
import { getPayloadForScreen, handleUIAction } from '../systems/ui_actions.js';

function compactBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(1)} KB`;
}

function recoveryLabel(source) {
	if (source === 'backup') return ' from the recovery copy';
	if (source === 'legacy') return ' after migrating the legacy Chronicle';
	return '';
}

function exportedFilename() {
	return `scribe-journey-chronicle-${new Date().toISOString().slice(0, 10)}.json`;
}

/** Routes intention while persistence remains a validated boundary, never assignment. */
export function createActionDispatcher(context) {
	const {
		getState,
		getTrigger,
		callbacks,
		mapContext,
		persistence,
		resetGame,
		adoptState
	} = context;

	function pressConfirm(state, payload) {
		const trigger = getTrigger();
		if (state.dialogue.active) {
			if (state.dialogue.botInteraction) {
				BotSystem.handleBotChoice(state, state.dialogue.choices[payload.index], callbacks.onUIUpdate, trigger);
			} else World.advanceDialogue(state, callbacks.onUIUpdate, trigger);
		} else if (state.mode === 'game') World.checkInteraction(state, trigger, callbacks.onUIUpdate);
		else if (state.mode === 'battle' && state.battle.awaitingConfirm) {
			Combat.handleAction(state, { action: 'confirm' }, callbacks.onUIUpdate, trigger);
		}
	}

	function persistenceAction(state, payload) {
		if (payload.action === 'saveGame') {
			const result = persistence.save(state);
			callbacks.onToast({ message: `Chronicle inscribed · ${compactBytes(result.bytes)}.`, type: 'success' });
			return true;
		}
		if (payload.action === 'loadGame') {
			const result = persistence.load();
			adoptState(result.state);
			callbacks.onUIUpdate({ screen: 'game' });
			callbacks.onToast({ message: `Chronicle restored${recoveryLabel(result.source)}.`, type: 'success' });
			return true;
		}
		if (payload.action === 'exportGame') {
			const result = persistence.exportState(state);
			callbacks.onUIUpdate({ exportChronicle: { text: result.text, filename: exportedFilename() } });
			callbacks.onToast({ message: `Portable Chronicle prepared · ${compactBytes(result.bytes)}.`, type: 'success' });
			return true;
		}
		if (payload.action === 'importGame') {
			const result = persistence.importText(payload.text);
			persistence.save(result.state);
			adoptState(result.state);
			callbacks.onUIUpdate({ screen: 'game' });
			callbacks.onToast({ message: 'Imported Chronicle validated and restored.', type: 'success' });
			return true;
		}
		return false;
	}

	return payload => {
		const state = getState();
		mapContext.update(state);
		if (payload.type === 'keyState') {
			if (state.mode === 'game') World.handleKeyState(state, payload.keys);
			return;
		}
		if (payload.type === 'press' && payload.key === 'Confirm') {
			pressConfirm(state, payload);
			return;
		}
		if (!payload.action) return;
		try {
			if (payload.action === 'newGame') {
				resetGame();
				getState().mode = 'game';
				callbacks.onUIUpdate({ screen: 'game' });
				return;
			}
			if (persistenceAction(state, payload)) return;
			if (payload.action === 'dialogueChoice') {
				if (state.dialogue.botInteraction) BotSystem.handleBotChoice(state, state.dialogue.choices[payload.index], callbacks.onUIUpdate, getTrigger());
				else World.handleDialogueChoice(state, payload.index, callbacks.onUIUpdate, getTrigger());
				return;
			}
			if (payload.action === 'battleAction') {
				Combat.handleAction(state, { ...payload, action: payload.combatAction }, callbacks.onUIUpdate, getTrigger());
				return;
			}
			handleUIAction(state, payload, callbacks, getTrigger());
			if (payload.fetchPayload) callbacks.onUIUpdate({ ...getPayloadForScreen(state, payload.fetchPayload) });
		} catch (error) {
			console.error(error);
			callbacks.onToast({ message: error.message || 'The Chronicle action failed.', type: 'error' });
		}
	};
}
