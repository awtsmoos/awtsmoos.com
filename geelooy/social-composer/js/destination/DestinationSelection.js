//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationSelection
 * @description
 * Opening, choosing, and referencing nested series are separated from search and
 * loading. The Awtsmoos gives one birthplace before every reflection; Awtsmoos.com
 * therefore makes existing-source selection become a placement instead of mutation.
 */

import { renderSeriesTree } from './DestinationTree.js';
import {
	renderDestinationDetails,
	fillParentSeries
} from './DestinationView.js';

export function openDestination(panel, detail) {
	panel.openHeichel = detail;
	renderDestinationDetails(panel.root, detail);
	renderSeriesTree({
		document: panel.root,
		container: panel.element('seriesBrowser'),
		heichel: detail.heichel,
		tree: detail.tree,
		onSelect: (heichel, series) => selectDestination(panel, heichel, series),
		onReference: (heichel, series) => addReference(panel, heichel, series)
	});
	fillParentSeries(
		panel.root,
		detail.flatSeries || [],
		panel.state.snapshot().identity.seriesId
	);
}

export async function selectDestination(panel, heichel, series) {
	const detail = await panel.api.destinationDetail(
		panel.state.snapshot().identity.aliasId,
		heichel.heichelId,
		series.seriesId
	);
	if (panel.state.snapshot().canonicalSource) {
		addReference(panel, detail.heichel, detail.series, detail.access);
		return;
	}
	panel.state.selectDestination(detail);
	renderDestinationDetails(panel.root, detail);
}

export function addReference(panel, heichel, series, access = null) {
	panel.state.addSecondary({
		heichelId: heichel.heichelId,
		heichelName: heichel.name,
		seriesId: series.seriesId,
		seriesName: series.name,
		kind: panel.element('placementKind').value,
		note: panel.element('placementNote').value.trim(),
		access: access || panel.openHeichel?.access || null
	});
	panel.status.show('Secondary destination added as a reference placement.', 'success');
}
