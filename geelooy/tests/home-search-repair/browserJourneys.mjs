// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSearchBrowserJourneys
 * @description
 * Desktop and mobile Home/library journeys remain explicit and independently testable.
 */

import assert from 'node:assert/strict';
import {
	HOME_SELECTORS,
	LIBRARY_SELECTORS
} from './ContrastSelectors.mjs';
import {
	assertContrast,
	assertHomeStyles,
	assertLibraryStyles,
	columnCount,
	setViewport,
	visit
} from './browserGateHelpers.mjs';

export async function desktopJourney(context) {
	await setViewport(context.harness.client, 1440, 1000, false);
	const home = await page(context, '/', HOME_SELECTORS, 'home-desktop.png');
	assertContrast(home, 'Home desktop');
	assertHomeStyles(home);
	context.steps.push({ name: 'homeDesktop', evidence: home });
	const library = await page(
		context,
		'/mawgawl/sefarim/?q=kohen%20gadol',
		LIBRARY_SELECTORS,
		'library-desktop.png'
	);
	assertContrast(library, 'Library desktop');
	assertLibraryStyles(library);
	assert(library.rows.some(row => row.text.includes('Kohen Gadol')));
	context.steps.push({ name: 'libraryDesktop', evidence: library });
}

export async function mobileJourney(context) {
	await setViewport(context.harness.client, 390, 844, true);
	const home = await page(context, '/', HOME_SELECTORS, 'home-mobile.png');
	assertContrast(home, 'Home mobile');
	assert.equal(
		await columnCount(context.harness.client, '.home-dashboard-shell'),
		1
	);
	context.steps.push({ name: 'homeMobile', evidence: home });
	const library = await page(
		context,
		'/mawgawl/sefarim/?q=kohen%20gadol',
		LIBRARY_SELECTORS,
		'library-mobile.png'
	);
	assertContrast(library, 'Library mobile');
	assert.equal(
		await columnCount(context.harness.client, '.library-search-form'),
		1
	);
	context.steps.push({ name: 'libraryMobile', evidence: library });
}

function page(context, url, selectors, screenshot) {
	return visit({
		harness: context.harness,
		url,
		selectors,
		evidence: context.evidence,
		screenshot
	});
}
