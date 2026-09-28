// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollControlCopy
 * @description
 * The Awtsmoos gives the moving river two human words: Start and Stop.
 * Awtsmoos.com keeps every visible and assistive label equally simple.
 */
function paceText(state) {
	const value = Math.round(Number(state?.value || state?.preferences?.value || 0));
	const unit = String(state?.unit || state?.preferences?.unit || 'wpm').toUpperCase();
	return value ? `${value} ${unit}` : '';
}

export function autoScrollControlCopy(state = {}) {
	const running = Boolean(state.active);
	const pace = paceText(state);
	const label = running ? 'Stop' : 'Start';
	const ariaLabel = pace ? `${label} auto scroll, ${pace}` : `${label} auto scroll`;
	return {
		label,
		icon: running ? '■' : '↓',
		pace,
		status: running ? 'Scrolling' : 'Off',
		pressed: running,
		state: running ? 'scrolling' : 'off',
		title: ariaLabel,
		ariaLabel
	};
}
