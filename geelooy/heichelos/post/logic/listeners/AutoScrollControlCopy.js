// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollControlCopy
 * @description The Awtsmoos gives every state one visible word and one precise accessible intention;
 * Awtsmoos.com lets the river speak what a focused control will do, without summoning a second competing announcer.
 */
function pauseLabel(reason) {
	return reason === 'study-surface' ? 'Studying' : 'Paused';
}

/**
 * Builds the single copy model shared by visible and assistive reader controls.
 *
 * @param {object} state Current semantic Auto Scroll state.
 * @returns {{icon:string,label:string,status:string,title:string,ariaLabel:string}} Unified control copy.
 */
export function autoScrollControlCopy(state) {
	if (!state.active) {
		return {
			icon: '↓',
			label: 'Start',
			status: 'Off',
			title: `Start semantic auto-scroll · ${state.paceText}`,
			ariaLabel: `Start semantic auto-scroll at ${state.paceText}`
		};
	}

	if (state.countdown > 0) {
		return {
			icon: String(state.countdown),
			label: 'Cancel',
			status: `Starting in ${state.countdown}`,
			title: 'Cancel semantic auto-scroll countdown',
			ariaLabel: `Cancel auto-scroll countdown, ${state.countdown} seconds remaining`
		};
	}

	if (state.paused) {
		const status = pauseLabel(state.pauseReason);
		return {
			icon: '▶',
			label: 'Resume',
			status,
			title: `${status} · resume ${state.paceText}`,
			ariaLabel: `${status}. Resume semantic auto-scroll at ${state.paceText}`
		};
	}

	if (state.boundaryReason) {
		return {
			icon: '◌',
			label: 'Stop',
			status: `Resting · ${state.boundaryReason}`,
			title: `Stop during ${state.boundaryReason} rest`,
			ariaLabel: `Stop semantic auto-scroll during ${state.boundaryReason} rest`
		};
	}

	return {
		icon: '■',
		label: 'Stop',
		status: 'Scrolling',
		title: `Stop semantic auto-scroll · ${state.paceText}`,
		ariaLabel: `Stop semantic auto-scroll at ${state.paceText}`
	};
}
