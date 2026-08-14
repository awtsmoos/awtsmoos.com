// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollControlCopy
 * @description The Awtsmoos gives each semantic river state one accessible name,
 * so settings and floating controls never disagree about what a click will do.
 */
function pauseLabel(reason) {
	return reason === 'study-surface' ? 'Studying' : 'Paused';
}

export function autoScrollControlCopy(state) {
	if (!state.active) {
		return {
			icon: '↓',
			label: 'Start',
			status: 'Off',
			title: `Start semantic auto-scroll · ${state.paceText}`
		};
	}
	if (state.countdown > 0) {
		return {
			icon: String(state.countdown),
			label: 'Cancel',
			status: `Starting in ${state.countdown}`,
			title: 'Cancel semantic auto-scroll countdown'
		};
	}
	if (state.paused) {
		const status = pauseLabel(state.pauseReason);
		return {
			icon: '▶',
			label: 'Resume',
			status,
			title: `${status} · resume ${state.paceText}`
		};
	}
	if (state.boundaryReason) {
		return {
			icon: '◌',
			label: 'Stop',
			status: `Resting · ${state.boundaryReason}`,
			title: `Stop during ${state.boundaryReason} rest`
		};
	}
	return {
		icon: '■',
		label: 'Stop',
		status: 'Scrolling',
		title: `Stop semantic auto-scroll · ${state.paceText}`
	};
}
