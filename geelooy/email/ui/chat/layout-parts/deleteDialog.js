// B"H
/**
 * @module QuantumMailDeleteDialog
 * @description Deletion remains explicit and dramatic, but the irreversible API
 * action cannot fire without a separate confirmation button.
 */
import { deleteThread } from '../../../network.js';
import { state } from '../../../store.js';
import { renderThreadList } from '../../sidebar.js';
import { FX } from '../../fx.js';
import { chatState } from '../state.js';

/** Opens the thread-purge confirmation overlay. */
export function showDeleteConfirmation(ui, parent) {
	const id = `delConfirm_${Date.now()}`;
	ui.html({
		parent: parent.closest('.app-container') || parent,
		tag: 'section',
		classList: ['overlay', 'visible', 'quantum-confirm-overlay'],
		dataset: { id },
		attributes: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${id}_title` },
		children: [{
			tag: 'div',
			classList: ['modal-card', 'holo-border', 'quantum-confirm-card'],
			children: [
				{ tag: 'p', classList: ['mail-modal-kicker'], textContent: 'IRREVERSIBLE PROTOCOL' },
				{ tag: 'h3', attributes: { id: `${id}_title` }, textContent: 'Purge this timeline?' },
				{ tag: 'p', textContent: 'The complete local thread history will be deleted. This action cannot be undone.' },
				{ tag: 'div', classList: ['quantum-confirm-actions'], children: [
					{ tag: 'button', classList: ['quantum-cancel'], attributes: { type: 'button' }, textContent: 'Abort', events: { click: () => removeDialog(id) } },
					{ tag: 'button', classList: ['quantum-purge'], attributes: { type: 'button' }, textContent: 'Purge timeline', events: { click: () => purgeThread(id) } }
				] }
			]
		}]
	});
	requestAnimationFrame(() => document.querySelector(`[data-id="${id}"] button`)?.focus());
}

async function purgeThread(id) {
	const threadId = chatState.activeThreadId;
	if (!threadId) return removeDialog(id);
	const button = document.querySelector(`[data-id="${id}"] .quantum-purge`);
	if (button) {
		button.disabled = true;
		button.textContent = 'Purging…';
	}
	try {
		FX.playSound?.('error');
		await deleteThread(threadId);
		delete state.threads[threadId];
		state.snippets = state.snippets.filter(item => item.correspondent !== threadId);
		renderThreadList();
		removeDialog(id);
		document.querySelector('.back-button')?.click();
	} catch (error) {
		if (button) {
			button.disabled = false;
			button.textContent = error?.message || 'Purge failed — retry';
		}
	}
}

function removeDialog(id) {
	document.querySelector(`[data-id="${id}"]`)?.remove();
}
