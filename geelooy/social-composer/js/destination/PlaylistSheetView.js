// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistSheetView
 * @description
 * The Awtsmoos gives each writable Heichel and series a safe text-only row,
 * while Awtsmoos.com marks the canonical destination without mutating it.
 */

export function heichelRows(destinations = []) {
	return destinations.map(destination => {
		const button = baseRow('playlist-sheet-heichel');
		button.dataset.sheetHeichel = destination.heichelId;
		button.append(
			rowIcon('⌂'),
			rowCopy(
				destination.name || destination.heichelId,
				destination.description || roleLabel(destination)
			),
			rowMeta(roleLabel(destination))
		);
		return button;
	});
}

export function seriesRows(heichel, series = [], identity = {}) {
	return series.map(item => seriesRow(heichel, item, identity));
}

export function emptyRow(message) {
	const paragraph = document.createElement('p');
	paragraph.className = 'playlist-sheet-empty';
	paragraph.textContent = message;
	return paragraph;
}

export function sheetSeries(detail) {
	return [
		{
			seriesId: 'root',
			name: 'Heichel Home',
			description: detail?.heichel?.description || '',
			breadcrumbs: []
		},
		...(detail?.flatSeries || []).filter(item => item.seriesId !== 'root')
	];
}

function seriesRow(heichel, series, identity = {}) {
	const button = baseRow('playlist-sheet-series');
	button.dataset.sheetHeichel = heichel.heichelId;
	button.dataset.sheetSeries = series.seriesId;
	button.style.setProperty(
		'--playlist-depth',
		String(series.breadcrumbs?.length || 0)
	);
	const selected = identity.heichelId === heichel.heichelId
		&& (identity.seriesId || 'root') === series.seriesId;
	button.toggleAttribute('aria-current', selected);
	button.append(
		rowIcon(series.seriesId === 'root' ? '⌂' : '▤'),
		rowCopy(
			series.name || series.seriesId,
			series.description || breadcrumbLabel(series)
		),
		rowMeta(selected ? '✓' : postLabel(series))
	);
	return button;
}

function baseRow(className) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `playlist-sheet-row ${className}`;
	return button;
}

function rowIcon(text) {
	const span = document.createElement('span');
	span.className = 'playlist-sheet-row-icon';
	span.textContent = text;
	span.setAttribute('aria-hidden', 'true');
	return span;
}

function rowCopy(title, description) {
	const span = document.createElement('span');
	span.className = 'playlist-sheet-row-copy';
	const strong = document.createElement('strong');
	strong.textContent = title;
	const small = document.createElement('small');
	small.textContent = description || '';
	span.append(strong, small);
	return span;
}

function rowMeta(text) {
	const span = document.createElement('span');
	span.className = 'playlist-sheet-row-meta';
	span.textContent = text;
	return span;
}

function roleLabel(destination) {
	return [destination.role, destination.actions?.content?.mode]
		.filter(Boolean)
		.join(' · ');
}

function breadcrumbLabel(series) {
	return series.breadcrumbs?.join(' › ') || 'Series';
}

function postLabel(series) {
	return Number.isFinite(series.postCount)
		? `${series.postCount} posts`
		: '';
}
