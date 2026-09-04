// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceVirtualWork
 * @description
 * The Awtsmoos lets one sefer open page after page while its stable work identity never slips away;
 * Awtsmoos.com keeps pagination inside the true Torah breadcrumb and never exposes the provider as the way.
 */

import { browseTorahLibrary } from '../api/torahLibrary.js';
import { workSeriesId } from '../torahLibraryIds.js?v=torah-tree-005';
import {
	moreCard,
	pageCard,
	workCard
} from '../torahLibraryPresentation.js?v=torah-tree-005';
import { sourceDefinition } from '../torahSourceHierarchy.js?v=torah-tree-005';
import {
	domainBreadcrumb,
	virtualVessel
} from './shared.js?v=torah-tree-005';

export async function loadSourceWork(identity) {
	const definition = sourceDefinition(
		identity.view,
		identity.work
	);
	if (!definition) {
		throw new Error(`Unknown Torah source work branch: ${identity.view}`);
	}
	const result = await browseTorahLibrary({
		level: 'work',
		domain: definition.sourceDomain,
		work: identity.work,
		offset: identity.offset,
		limit: 80
	});
	const pages = (result.items || [])
		.map(item => pageCard(
			item,
			definition.view,
			identity.work
		));
	if (result.nextOffset !== null && result.nextOffset !== undefined) {
		pages.push(moreCard(
			definition.view,
			identity.work,
			result.nextOffset
		));
	}
	const title = result.title || identity.work;
	const seriesData = {
		...workCard({
			id: identity.work,
			title,
			count: result.total
		}, definition.view),
		id: workSeriesId(
			definition.view,
			identity.work,
			identity.offset
		)
	};
	return virtualVessel(
		seriesData,
		domainBreadcrumb(definition),
		pages
	);
}
