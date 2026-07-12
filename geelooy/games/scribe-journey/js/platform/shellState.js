// B"H

function titleFromMapId(mapId = '') {
	return mapId
		.replace(/^world_/, 'Wilderness ')
		.replace(/_/g, ' ')
		.replace(/\b\w/g, character => character.toUpperCase()) || 'Unknown Path';
}

function coordinateText(renderState) {
	const player = renderState.player || {};
	return `${renderState.currentMapId || 'unknown'} · ${Math.round(player.x || 0)}, ${Math.round(player.y || 0)} · ${player.direction || 'down'}`;
}

/** Mirrors game truth into readable DOM landmarks without owning that truth. */
export function createShellState() {
	const locationName = document.getElementById('location-name');
	const timeLabel = document.getElementById('status-time');
	const questChip = document.getElementById('quest-chip');
	const contextPrompt = document.getElementById('context-prompt');
	const actionLabel = document.getElementById('context-action-label');
	const coordinateReadout = document.getElementById('coordinate-readout');

	const setMode = mode => {
		document.body.dataset.gameMode = mode || 'game';
	};

	return {
		setMode,
		updateState(renderState) {
			setMode(renderState.mode);
			if (locationName) locationName.textContent = titleFromMapId(renderState.currentMapId);
			if (coordinateReadout) coordinateReadout.textContent = coordinateText(renderState);
		},
		updateTime(payload) {
			if (!timeLabel) return;
			const totalMinutes = Number(payload.timeOfDay) || 0;
			const hours = Math.floor(totalMinutes / 60) % 24;
			const minutes = Math.floor(totalMinutes % 60);
			const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
			timeLabel.textContent = payload.dateString ? `${payload.dateString} · ${time}` : time;
		},
		updateUI(payload) {
			if (payload.screen) setMode(payload.screen === 'game' ? 'game' : payload.screen);
			if ('dialogue' in payload) {
				document.body.classList.toggle('has-dialogue', Boolean(payload.dialogue?.active));
				if (actionLabel) actionLabel.textContent = payload.dialogue?.active ? 'NEXT' : 'ACT';
			}
			if (payload.questLog?.quests?.length && questChip) {
				const active = payload.questLog.quests.find(quest => !quest.completed);
				questChip.textContent = active?.name || active?.title || 'Continue the journey';
			}
		},
		setPrompt(message = 'Explore. Speak. Reveal the hidden spark.') {
			if (contextPrompt) contextPrompt.textContent = message;
		}
	};
}
