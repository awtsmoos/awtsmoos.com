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

// B"H (15s pass): the launch veil now speaks for the WHOLE load, not only
// first playability. Each named stage owns a floor of the overall bar, so
// the percent is driven by completed stages (and, inside the player stage,
// by real GLB bytes) and can never run backwards or sit silent: a stage
// change always moves the label, and the bar moves at least to the floor
// of the stage that has actually been reached.
const LAUNCH_STAGE_FLOORS = Object.freeze({
	'world-entry-handler': 0.05,
	'generated-essential-player': 0.3,
	'neighbors-arriving': 0.9
});
const LAUNCH_STAGE_LABELS = Object.freeze({
	'world-entry-handler': 'Opening the doorway',
	'generated-essential-player': 'Loading the authored player',
	'neighbors-arriving': 'Your neighbors are arriving'
});

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
			<p data-launch-stage>Opening the doorway</p>
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
			this._shownProgress = 1;
			content.querySelector('[data-launch-fill]').style.width = '100%';
			content.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', '100');
			this.update({ message: 'World ready.' });
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
			const stageLabel = normalized.stage ? LAUNCH_STAGE_LABELS[normalized.stage] : null;
			if (stageLabel) content.querySelector('[data-launch-stage]').textContent = stageLabel;
			let progress = Number.isFinite(normalized.progress) ? normalized.progress : null;
			if (normalized.stage === 'generated-essential-player' && progress !== null) {
				// The forwarded fraction measures the player GLB alone; scale
				// it into that stage's band of the whole load (30% → 60%).
				progress = 0.3 + 0.3 * Math.max(0, Math.min(1, progress));
			}
			const floor = normalized.stage ? LAUNCH_STAGE_FLOORS[normalized.stage] : undefined;
			if (floor !== undefined) progress = Math.max(progress ?? 0, floor);
			if (progress !== null) {
				// The bar is monotonic and may not claim completion early:
				// only complete() may show 100%.
				const capped = Math.min(0.99, Math.max(0, progress));
				this._shownProgress = Math.max(this._shownProgress || 0, capped);
				const percent = Math.round(this._shownProgress * 100);
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
