//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveHistoryTab
 * @description
 * Defensive loader for the provenance "History" tab component. The history
 * component is owned by the provenance workstream and ships in a NEW file,
 * js/views/DriveHistoryPane.js, exporting renderHistoryTab(entry). Until it
 * lands, this resolves to a quiet placeholder instead of breaking the pane.
 *
 * Integration contract (all forms are honored):
 *   1. module:  const { renderHistoryTab } = await import('./DriveHistoryPane.js')
 *   2. global:  if (typeof renderHistoryTab === 'function') renderHistoryTab(entry)
 *   3. result:  a DOM Element is returned as-is; an HTML string (WS-5's
 *               DriveHistoryPane renders an HTML string) is parsed into its
 *               first top-level element before it reaches the details pane.
 */

/* global renderHistoryTab */

export async function renderHistoryTabPane(entry) {
	try {
		const module = await import('./DriveHistoryPane.js');
		if (module && typeof module.renderHistoryTab === 'function') {
			const element = toElement(await module.renderHistoryTab(entry));
			if (element) return element;
		}
	} catch {
		// The provenance component has not landed yet — fall through.
	}
	if (typeof renderHistoryTab === 'function') {
		const element = toElement(await renderHistoryTab(entry));
		if (element) return element;
	}
	return historyPlaceholder();
}

/**
 * Coerces a tab render result into a DOM element. WS-5's DriveHistoryPane
 * returns an HTML string; the details pane calls wrap.replaceChildren(node),
 * and passing a raw string there would insert visible markup as text.
 */
export function toElement(value) {
	if (!value) return null;
	if (typeof value !== 'string') return value;
	if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
	const template = document.createElement('template');
	template.innerHTML = value.trim();
	return template.content.firstElementChild;
}

export function historyPlaceholder() {
	const wrap = document.createElement('div');
	wrap.className = 'drive-details-history-empty';
	const message = document.createElement('p');
	message.textContent = 'History arrives with the provenance update.';
	wrap.append(message);
	return wrap;
}
