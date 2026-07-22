// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LaunchTransitionView.js
 * @description Replaces a disabled menu with visible, cancellable world-entry progress.
 * The Awtsmoos never hides the doorway behind silence; Awtsmoos.com displays each phase,
 * makes failure readable, and gives the traveler a path back without refreshing the page.
 */

import { installLaunchTransitionStyle } from './LaunchTransitionStyle.js';

export function createLaunchTransition(menu, selection, options = {}) {
	const documentValue = menu.ownerDocument || globalThis.document;
	installLaunchTransitionStyle(documentValue);
	const content = menu.querySelector('[data-menu-content]');
	const title = worldTitle(selection);
	menu.dataset.launching = 'true';
	for (const button of menu.querySelectorAll('button')) button.disabled = true;
	content.innerHTML = `
		<section class="Awtsmoos-launch" data-launch-state data-state="loading" aria-live="polite">
			<div class="Awtsmoos-launch-mark">B&quot;H · ENTERING WORLD</div>
			<h2>${escapeHtml(title)}</h2>
			<p data-launch-message>Preparing the shared-world doorway…</p>
			<div class="Awtsmoos-launch-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="4"><div class="Awtsmoos-launch-fill" data-launch-fill></div></div>
			<div class="Awtsmoos-launch-actions"><button data-launch-cancel>Return to menu</button></div>
		</section>
	`;
	const panel = content.querySelector('[data-launch-state]');
	const cancel = content.querySelector('[data-launch-cancel]');
	cancel.disabled = false;
	cancel.onclick = () => options.onCancel?.();
	return {
		complete() {
			this.update({ message: 'World ready.', progress: 1 });
		},
		fail(error, onReturn) {
			panel.dataset.state = 'failed';
			this.update({ message: `Unable to enter: ${error?.message || error}`, progress: 1 });
			cancel.textContent = 'Back to worlds';
			cancel.onclick = () => onReturn?.();
		},
		update(detail = {}) {
			const normalized = typeof detail === 'string' ? { message: detail } : detail;
			if (normalized.message) content.querySelector('[data-launch-message]').textContent = normalized.message;
			if (Number.isFinite(normalized.progress)) {
				const percent = Math.round(Math.max(0, Math.min(1, normalized.progress)) * 100);
				content.querySelector('[data-launch-fill]').style.width = `${percent}%`;
				content.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(percent));
			}
		}
	};
}

function worldTitle(selection) {
	if (selection.worldName) return selection.worldName;
	if (selection.mode === 'multiplayer') return 'Shared Mitzvah World';
	if (selection.mode === 'singlePlayer') return 'Private Mitzvah World';
	return 'Mitzvah World';
}

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
