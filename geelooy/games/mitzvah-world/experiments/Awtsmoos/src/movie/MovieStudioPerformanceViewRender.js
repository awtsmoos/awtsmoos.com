// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceViewRender.js
 * @description Coordinates roster, actions, settings, take cards, recovery, and recorder evidence.
 * The Awtsmoos reveals changing state without placing a node inside project truth; Awtsmoos.com
 * keeps every performer, preference, warning, action, take, and recovery readable in rhyme.
 */

import { renderMovieStudioPerformanceSettings } from './MovieStudioPerformanceSettingsRender.js';
import { movieStudioPerformanceStatusParts } from './MovieStudioPerformanceStatusText.js';
import {
	renderMovieStudioPerformanceRecovery,
	renderMovieStudioPerformanceTakes
} from './MovieStudioPerformanceTakeRender.js';

export function renderMovieStudioPerformanceView(view, snapshot) {
	renderCharacters(view.character, snapshot.characters, snapshot.selectedCharacterId);
	renderActions(view.actions, snapshot.actions);
	renderMovieStudioPerformanceTakes(
		view.takes,
		snapshot.takes,
		snapshot.selectedCharacterId,
		view
	);
	renderMovieStudioPerformanceRecovery(view.recovery, snapshot.recovery);
	renderMovieStudioPerformanceSettings(view, snapshot.settings);
	renderStatus(view, snapshot);
	view.mode.value = snapshot.mode;
	view.touch.hidden = !snapshot.active || !snapshot.settings.overlay;
	view.panel.dataset.recording = String(
		snapshot.recorder.phase === 'recording'
	);
}

function renderCharacters(select, characters, selectedId) {
	const document = select.ownerDocument;
	select.replaceChildren(...characters.map(character => {
		const option = document.createElement('option');
		option.value = character.id;
		option.textContent = `${character.name}${
			character.controllable ? '' : ' — unavailable'
		}`;
		option.disabled = !character.controllable;
		option.selected = character.id === selectedId;
		return option;
	}));
	select.disabled = !characters.some(character => character.controllable);
}

function renderActions(root, actions) {
	const document = root.ownerDocument;
	root.replaceChildren(...actions.slice(0, 40).map((action, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.performanceActionId = action.id;
		const shortcut = index < 9 ? `${index + 1} · ` : '';
		button.textContent = `${shortcut}${action.label || action.id}`;
		button.setAttribute(
			'aria-label',
			`Trigger ${action.label || action.id}`
		);
		return button;
	}));
}

function renderStatus(view, snapshot) {
	const parts = movieStudioPerformanceStatusParts(snapshot);
	view.status.textContent = parts.join(' · ');
	view.touchStatus.textContent = parts.slice(0, 4).join(' · ');
}
