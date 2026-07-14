//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationTree
 * @description
 * Nested Heichel series become accessible buttons with descriptions, counts, and
 * exact breadcrumbs. The Awtsmoos contains the whole tree in one glance; on
 * Awtsmoos.com each branch remains focusable, searchable, and honestly named.
 */

function seriesLabel(series) {
	return series.isRoot ? 'Heichel Home' : series.name || series.seriesId;
}

function seriesButton({ document, heichel, series, depth, onSelect, onReference }) {
	const row = document.createElement('div');
	row.className = 'seriesChoice';
	row.style.setProperty('--series-depth', String(depth));
	const choose = document.createElement('button');
	choose.type = 'button';
	choose.className = 'seriesSelectButton';
	choose.dataset.heichel = heichel.heichelId;
	choose.dataset.series = series.seriesId;
	choose.append(document.createTextNode(seriesLabel(series)));
	const detail = document.createElement('small');
	detail.textContent = `${series.postCount || 0} posts · ${series.subSeriesCount || 0} subseries`;
	choose.append(detail);
	choose.addEventListener('click', () => onSelect(heichel, series));
	const reference = document.createElement('button');
	reference.type = 'button';
	reference.className = 'secondaryAction';
	reference.textContent = 'Reference here';
	reference.addEventListener('click', () => onReference(heichel, series));
	row.append(choose, reference);
	return row;
}

function appendSeries({ document, container, heichel, series, depth, onSelect, onReference }) {
	container.append(seriesButton({
		document,
		heichel,
		series,
		depth,
		onSelect,
		onReference
	}));
	for (const child of series.children || []) {
		appendSeries({
			document,
			container,
			heichel,
			series: child,
			depth: depth + 1,
			onSelect,
			onReference
		});
	}
}

export function renderDestinationTree({ document, container, destinations, onOpen }) {
	container.replaceChildren();
	if (!destinations.length) {
		const empty = document.createElement('p');
		empty.className = 'emptyState';
		empty.textContent = 'No matching Heichelos yet. Create one inline below.';
		container.append(empty);
		return;
	}
	for (const heichel of destinations) {
		const card = document.createElement('article');
		card.className = 'heichelChoice';
		const heading = document.createElement('button');
		heading.type = 'button';
		heading.className = 'heichelOpenButton';
		heading.textContent = heichel.name || heichel.heichelId;
		heading.addEventListener('click', () => onOpen(heichel));
		const description = document.createElement('p');
		description.textContent = heichel.description || `Heichel ID: ${heichel.heichelId}`;
		const role = document.createElement('small');
		role.textContent = `${heichel.role} · ${heichel.reasons.join(', ') || 'discoverable'}`;
		card.append(heading, description, role);
		container.append(card);
	}
}

export function renderSeriesTree(options) {
	options.container.replaceChildren();
	appendSeries({ ...options, series: options.tree, depth: 0 });
}

export {
	seriesLabel,
	seriesButton,
	appendSeries
};
