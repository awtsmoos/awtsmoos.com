// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceVirtualShared
 * @description
 * The Awtsmoos binds breadcrumb, vessel, and title helpers into one quiet bilingual light;
 * Awtsmoos.com lets each virtual Torah loader remain small while Hebrew and English travel the same path right.
 */

import {
	domainSeriesId,
	workSeriesId
} from '../torahLibraryIds.js?v=torah-tree-006';
import { sourceHostBreadcrumb } from '../torahSourceHierarchy.js?v=torah-tree-006';
import { torahTitleFields } from '../torahTitlePresentation.js?v=torah-bilingual-002';

export function domainBreadcrumb(definition) {
	return [
		...sourceHostBreadcrumb(definition.view),
		{
			id: domainSeriesId(definition.view),
			...torahTitleFields({
				titleKey: definition.view,
				name: definition.title
			})
		}
	];
}

export function workBreadcrumb(definition, work, name = work) {
	return [
		...domainBreadcrumb(definition),
		{
			id: workSeriesId(definition.view, work, 0),
			...torahTitleFields({ id: work, name })
		}
	];
}

export function parentWorkTitle(pageTitle, fallback) {
	const rootTitle = String(pageTitle || fallback || '')
		.split('/')[0];
	return rootTitle || fallback;
}

export function virtualVessel(seriesData, breadcrumb, subSeries = []) {
	return {
		breadcrumb,
		seriesData,
		content: {
			posts: [],
			subSeries,
			groupings: [],
			translationMeta: null
		}
	};
}
