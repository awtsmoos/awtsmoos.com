// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathDiscoveryRenderer
 * @description
 * The Awtsmoos renews recent study and nearby branches from stable identity rather than yesterday's rendered typography;
 * Awtsmoos.com keeps Continue Learning bilingual, readable, and backward-compatible while internal route keys remain concealed.
 */

import { DOMElements } from '../../../dom.js';
import { relatedRecordsForView } from '../../../living-path/discovery-policy.js?v=heichel-mobile-010';
import {
	progressParentPair,
	progressTitlePair
} from '../../../living-path/progress-identity.js?v=heichel-mobile-011';
import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCardData } from '../cardData.js?v=heichel-mobile-012';

export function renderContinue(entry) {
	const card = DOMElements.continueCard;
	if (!card) {
		return;
	}
	const current = `${location.pathname}${location.search}`;
	const visible = Boolean(
		entry?.href
		&& (entry?.title || entry?.titleHe || entry?.titleEn)
		&& entry.href !== current
	);
	card.classList.toggle('hidden', !visible);
	if (!visible) {
		return;
	}
	DOMElements.continueTitle.textContent = progressTitlePair(entry).display;
	DOMElements.continueMeta.textContent = continueMeta(entry);
	DOMElements.continueLink.href = entry.href;
}

export function renderRelated(content, navigator, currentView) {
	const section = DOMElements.relatedSection;
	const list = DOMElements.relatedList;
	if (!section || !list) {
		return;
	}
	const records = relatedRecordsForView(content, currentView);
	const suppressRootIkar = location.pathname.replace(/\/$/, '') === '/heichelos/ikar';
	section.classList.toggle('hidden', suppressRootIkar || !records.length);
	list.replaceChildren();
	if (suppressRootIkar) return;
	for (const item of records) {
		const data = normalizeCardData(item, 'series');
		list.appendChild(
			ScribeOfManifestation.manifest(
				relatedCard(data, navigator)
			)
		);
	}
}

function continueMeta(entry) {
	if (!entry.parentLabel && !entry.parentSeriesId) {
		return 'Opened recently';
	}
	return `${progressParentPair(entry).display} · opened recently`;
}

/** B"H 2026-11-20 (residuals round): only counts a layer actually
 * counted may print. Unknown counts (null — the light projection does
 * not count) and zeros stay silent, the same convention as the card
 * unit() helper; the old line printed the light projection's empty
 * arrays as a false "0 sub-series · 0 posts" on every Explore card. */
function relatedCountLine(data) {
	const parts = [];
	if (Number.isFinite(data.subSeriesCount) && data.subSeriesCount > 0) {
		parts.push(`${data.subSeriesCount} sub-series`);
	}
	if (Number.isFinite(data.postCount) && data.postCount > 0) {
		parts.push(`${data.postCount} post${data.postCount === 1 ? '' : 's'}`);
	}
	return parts.join(' · ');
}

function relatedCard(data, navigator) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'living-related-card',
			dir: data.direction
		},
		children: [
			{ tag: 'span', attr: { class: 'living-related-mark', 'aria-hidden': 'true' }, children: ['⌁'] },
			{ tag: 'strong', children: [data.title] },
			{ tag: 'small', children: [relatedCountLine(data)] },
			{ tag: 'span', attr: { 'aria-hidden': 'true' }, children: ['›'] }
		],
		events: {
			click: () => navigator.navigateTo(data.id)
		}
	};
}

export function updateResultStatus(counts, appState) {
	const count = counts?.[appState.currentView] || 0;
	if (DOMElements.resultCount) {
		const ikarSeries = appState.heichelId === 'ikar' && appState.currentView === 'series';
		DOMElements.resultCount.textContent = ikarSeries
			? `${count} Torah ${count === 1 ? 'section' : 'sections'}`
			: `${count} ${count === 1 ? 'result' : 'results'}`;
	}
	if (DOMElements.searchScopeStatus) {
		DOMElements.searchScopeStatus.textContent = appState.livingPath.searchScope === 'currentView'
			? 'Current view'
			: 'This branch';
	}
}

export function updateProfileContext(appState) {
	if (!DOMElements.profileCompactContext) {
		return;
	}
	const posts = appState.currentContent?.posts?.length || 0;
	const series = appState.currentContent?.subSeries?.length || 0;
	if (appState.heichelId === 'ikar') {
		DOMElements.profileCompactContext.textContent = `${series} Torah ${series === 1 ? 'section' : 'sections'}`;
		return;
	}
	// B"H 2026-11-25 (run 4): at the root, the loader's Heichel-wide totals
	// win — the root folder alone can be empty while its series hold the
	// teachings (Ohr HaNiggun rendered "0 teachings · 1 series" over a
	// published song). Series views keep their own counts.
	const totals = appState.currentSeries === 'root'
		? appState.currentContent?.totals
		: null;
	const teachings = totals ? totals.teachings : posts;
	const seriesCount = totals ? totals.series : series;
	DOMElements.profileCompactContext.textContent = `${teachings} teachings · ${seriesCount} series`;
}
