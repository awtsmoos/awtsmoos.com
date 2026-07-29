// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbar.js
 * @description Builds accessible history, edit, marker, snapping, zoom, and time controls.
 * The Awtsmoos renews every command before the hand can claim it; Awtsmoos.com keeps
 * availability visible and semantic, so no disabled action masquerades as creative power.
 */

export function createTimelineToolbar(view) {
	const toolbar = document.createElement('div');
	toolbar.className = 'movie-timeline-toolbar';
	toolbar.innerHTML = `
		<div class="movie-timeline-command-group" aria-label="Edit commands">
			${button('undo', '↶', 'Undo')}
			${button('redo', '↷', 'Redo')}
			${button('split', 'Split', 'Split selected clip at playhead')}
			${button('duplicate', 'Dup', 'Duplicate selected clip')}
			${button('delete', 'Del', 'Delete selected clip')}
			${button('addMarker', 'Mark', 'Add marker at playhead')}
			${button('toggleSnap', 'Snap', 'Toggle timeline snapping', true)}
		</div>
		<div class="movie-timeline-command-group" aria-label="Timeline scale">
			<button data-zoom-out aria-label="Zoom timeline out" title="Zoom out (−)">−</button>
			<strong data-scale>${Math.round(view.scale)} px/s</strong>
			<button data-zoom-in aria-label="Zoom timeline in" title="Zoom in (+)">+</button>
			<button data-fit title="Fit sequence">Fit</button>
		</div>
		<output data-time aria-label="Current timeline time">0.00s</output>
		<span>${view.project.duration.toFixed(1)} seconds</span>
	`;
	bindCommands(toolbar, view);
	refreshTimelineToolbar(view, toolbar);
	return toolbar;
}

export function refreshTimelineToolbar(view, toolbar = null) {
	const root = toolbar || view.shell.querySelector('.movie-timeline-toolbar');
	if (!root) return;
	const state = view.commandState();
	setDisabled(root, 'undo', !state.canUndo);
	setDisabled(root, 'redo', !state.canRedo);
	for (const name of ['split', 'duplicate', 'delete']) {
		setDisabled(root, name, !state.hasSelection);
	}
	const snap = root.querySelector('[data-command="toggleSnap"]');
	snap?.setAttribute('aria-pressed', String(state.snapping));
	snap?.classList.toggle('is-active', state.snapping);
	root.querySelector('[data-scale]')?.replaceChildren(`${Math.round(view.scale)} px/s`);
}

function button(command, label, title, pressed = false) {
	return `<button data-command="${command}" title="${title}" aria-label="${title}"${
		pressed ? ' aria-pressed="false"' : ''
	}>${label}</button>`;
}

function bindCommands(toolbar, view) {
	for (const button of toolbar.querySelectorAll('[data-command]')) {
		button.addEventListener('click', () => view.runCommand(button.dataset.command));
	}
	toolbar.querySelector('[data-zoom-out]').addEventListener(
		'click',
		() => view.setScale(view.scale / 1.35)
	);
	toolbar.querySelector('[data-zoom-in]').addEventListener(
		'click',
		() => view.setScale(view.scale * 1.35)
	);
	toolbar.querySelector('[data-fit]').addEventListener('click', () => view.fit());
}

function setDisabled(root, command, disabled) {
	const button = root.querySelector(`[data-command="${command}"]`);
	if (button) button.disabled = Boolean(disabled);
}
