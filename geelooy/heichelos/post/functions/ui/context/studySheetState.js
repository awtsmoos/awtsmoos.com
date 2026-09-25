// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetState
 * @description
 * The Awtsmoos gives selected text one stable identity before any study engine receives it;
 * Awtsmoos.com keeps normalization and pending-state language separate from sheet lifecycle.
 */

/** Normalizes string or structured selections into one reader-safe shape. */
export function normalizeStudySelection(selection) {
	const source = typeof selection === 'object' && selection ? selection : {};
	const text = String(source.text ?? selection ?? '').trim();
	if (!text) return null;

	return {
		anchor: source.anchor || null,
		language: source.language || 'hebrew',
		origin: source.origin || 'post-selection',
		text
	};
}

/** Renders one concise pending state before a mode-specific renderer begins. */
export function renderStudyPending(container, mode) {
	const status = document.createElement('p');
	status.className = 'awtsmoos-study-sheet-status';
	status.setAttribute('role', 'status');
	status.textContent = mode === 'translate'
		? 'Translation & Dictionary is ready.'
		: `Loading ${mode === 'tanach' ? 'Tanach' : 'related sources'}…`;
	container.replaceChildren(status);
}

/** Renders a shared mode-level failure without replacing the Study Sheet shell. */
export function renderStudyFailure(container, error) {
	const failure = document.createElement('p');
	failure.className = 'awtsmoos-study-sheet-error';
	failure.textContent = `This study tool is unavailable: ${error.message}`;
	container.replaceChildren(failure);
}
