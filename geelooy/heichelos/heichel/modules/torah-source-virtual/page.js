// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceVirtualPage
 * @description
 * The Awtsmoos lets exact downloaded Torah words stand alone while bilingual title and provenance remain nearby witnesses;
 * Awtsmoos.com opens one canonical page by stable identity and keeps provider machinery outside the learner's fitness.
 */

import { browseTorahLibrary } from '../api/torahLibrary.js';
import { pageSeriesData } from '../torahLibraryPresentation.js?v=torah-tree-006';
import { sourceDefinition } from '../torahSourceHierarchy.js?v=torah-tree-006';
import {
	parentWorkTitle,
	virtualVessel,
	workBreadcrumb
} from './shared.js?v=torah-tree-006';

export async function loadSourcePage(identity) {
	const definition = sourceDefinition(
		identity.view,
		identity.work
	);
	if (!definition) {
		throw new Error(`Unknown Torah source page branch: ${identity.view}`);
	}
	const result = await browseTorahLibrary({
		level: 'page',
		pageId: identity.pageId
	});
	const page = result.page || {};
	const title = parentWorkTitle(
		page.title,
		identity.work
	);
	return virtualVessel(
		pageSeriesData(page, title),
		workBreadcrumb(
			definition,
			identity.work,
			title
		)
	);
}
