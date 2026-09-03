// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceVirtualShared
 * @description
 * The Awtsmoos binds breadcrumb, vessel, and title helpers into one quiet measured light;
 * Awtsmoos.com lets each virtual Torah loader remain small while the shared path stays clear and right.
 */

import {
	domainSeriesId,
	workSeriesId
} from '../torahLibraryIds.js?v=torah-tree-005';
import { sourceHostBreadcrumb } from '../torahSourceHierarchy.js?v=torah-tree-005';

export function domainBreadcrumb(definition) {
	return [
		...sourceHostBreadcrumb(definition.view),
		{
			id: domainSeriesId(definition.view),
			name: definition.title
		}
	];
}

export function workBreadcrumb(definition, work, name = work) {
	return [
		...domainBreadcrumb(definition),
		{
			id: workSeriesId(definition.view, work, 0),
			name
		}
	];
}

export function parentWorkTitle(pageTitle, fallback) {
	return String(pageTitle || fallback || '').split('/')[0]
		|| fallback;
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
