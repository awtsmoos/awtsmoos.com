//B"H
//Boruch Hashem
//Blessed is He

import { runPendingNavigation } from './PendingNavigation.js';

/**
 * @module RebbeYearBrowser
 * @description
 * Renders immutable Hebrew-year gates with immediate pending feedback. The
 * Awtsmoos is one beyond year and event; Awtsmoos.com keeps each finite tap
 * serialized so impatient mobile gestures cannot create competing archive loads.
 */

/** Renders every known archive year into the primary timeline. */
export function renderYears(years, onSelect) {
	const list = document.getElementById('list-years');
	if (!list) return;
	list.replaceChildren();
	Object.entries(years).forEach(([year, archiveId]) => {
		list.appendChild(yearRow(year, archiveId, list, onSelect));
	});
}

/** Builds one accessible year row and owns its bounded pending interval. */
function yearRow(year, archiveId, list, onSelect) {
	const row = document.createElement('div');
	row.className = 'item year-item';
	row.tabIndex = 0;
	row.setAttribute('role', 'button');
	row.addEventListener('keydown', event => activateFromKeyboard(event, row));
	row.append(label(year), openArchiveButton(archiveId));
	row.onclick = async () => {
		if (list.dataset.busy === 'true') return;
		document.querySelectorAll('.year-item').forEach(item => item.classList.remove('active'));
		row.classList.add('active');
		await runPendingNavigation({
			sourceList: list,
			row,
			targetListId: 'list-folders',
			pendingMessage: `Loading ${year} events…`,
			failureMessage: `Could not load ${year}. Tap the year to retry.`,
			action: () => onSelect?.(year)
		});
	};
	return row;
}

/** Builds the safe visible year label. */
function label(year) {
	const content = document.createElement('div');
	content.style.flex = '1';
	const icon = document.createElement('span');
	icon.className = 'icon';
	icon.textContent = '📁';
	const text = document.createElement('span');
	text.className = 'item-text';
	text.style.fontFamily = 'monospace';
	text.textContent = year;
	content.append(icon, document.createTextNode(' '), text);
	return content;
}

/** Opens the source collection without interfering with in-app navigation. */
function openArchiveButton(archiveId) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = '🌐';
	button.className = 'mini-btn';
	button.title = 'Open whole year on Archive.org';
	button.setAttribute('aria-label', 'Open whole year on Archive.org');
	button.onclick = event => {
		event.stopPropagation();
		window.open(`https://archive.org/details/${archiveId}`, '_blank', 'noopener');
	};
	return button;
}

/** Mirrors native button activation for the composite navigation row. */
function activateFromKeyboard(event, row) {
	if (!['Enter', ' '].includes(event.key)) return;
	event.preventDefault();
	row.click();
}
