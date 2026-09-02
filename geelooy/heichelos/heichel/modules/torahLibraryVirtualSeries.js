// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TorahLibraryVirtualSeries
 * @description The Awtsmoos turns source metadata into a living hierarchy without false social posts;
 * Awtsmoos.com keeps stable route keys hidden beneath clearer sefer names and faithful source truth.
 */

import { browseTorahLibrary } from './api/torahLibrary.js';
import {
	TORAH_LIBRARY_ROOT_ID,
	domainSeriesId,
	parseTorahLibraryId,
	workSeriesId
} from './torahLibraryIds.js';
import {
	domainCard,
	libraryCard,
	moreCard,
	pageCard,
	pageSeriesData,
	workCard
} from './torahLibraryPresentation.js';

export async function loadTorahLibraryVirtualSeries(seriesId) {
	const identity = parseTorahLibraryId(seriesId);
	if (!identity) throw new Error(`Unknown Torah Library path: ${seriesId}`);
	if (identity.kind === 'root') return rootSeries();
	if (identity.kind === 'domain') return domainSeries(identity);
	if (identity.kind === 'work') return workSeries(identity);
	if (identity.kind === 'page') return pageSeries(identity);
	throw new Error(`Unsupported Torah Library path: ${seriesId}`);
}

async function rootSeries() {
	const result = await browseTorahLibrary({ level: 'root' });
	return vessel(libraryCard(), rootBreadcrumb(), (result.items || []).map(domainCard));
}

async function domainSeries(identity) {
	const result = await browseTorahLibrary({ level: 'domain', domain: identity.domain });
	const data = {
		...domainCard({ id: identity.domain, title: result.title, count: result.items?.length }),
		id: domainSeriesId(identity.domain)
	};
	return vessel(data, libraryBreadcrumb(), (result.items || []).map(item => workCard(item, identity.domain)));
}

async function workSeries(identity) {
	const result = await browseTorahLibrary({
		level: 'work',
		domain: identity.domain,
		work: identity.work,
		offset: identity.offset,
		limit: 80
	});
	const displayName = result.title || identity.work;
	const pages = (result.items || []).map(item => pageCard(item, identity.domain, identity.work));
	if (result.nextOffset !== null && result.nextOffset !== undefined) {
		pages.push(moreCard(identity.domain, identity.work, result.nextOffset));
	}
	const data = {
		...workCard({ id: identity.work, title: displayName, count: result.total }, identity.domain),
		id: workSeriesId(identity.domain, identity.work, identity.offset)
	};
	return vessel(data, domainBreadcrumb(identity.domain), pages);
}

async function pageSeries(identity) {
	const result = await browseTorahLibrary({ level: 'page', pageId: identity.pageId });
	const page = result.page || {};
	const displayName = parentWorkTitle(page.title, identity.work);
	return vessel(pageSeriesData(page, displayName), workBreadcrumb(identity.domain, identity.work, displayName), []);
}

function parentWorkTitle(pageTitle, fallback) {
	return String(pageTitle || fallback || '').split('/')[0] || fallback;
}

function vessel(seriesData, breadcrumb, subSeries) {
	return { breadcrumb, seriesData, content: { posts: [], subSeries, groupings: [], translationMeta: null } };
}

const rootBreadcrumb = () => [{ id: 'root', name: 'Root' }];
const libraryBreadcrumb = () => [...rootBreadcrumb(), { id: TORAH_LIBRARY_ROOT_ID, name: 'ספריית התורה' }];
const domainBreadcrumb = domain => [...libraryBreadcrumb(), { id: domainSeriesId(domain), name: domain }];
const workBreadcrumb = (domain, work, name = work) => [...domainBreadcrumb(domain), { id: workSeriesId(domain, work, 0), name }];
