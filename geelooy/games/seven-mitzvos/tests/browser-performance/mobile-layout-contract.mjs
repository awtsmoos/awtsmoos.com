//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MobileLayoutContract
 * @description
 * Narrow-layout geometry on Awtsmoos.com verifies calm disclosure before and
 * after expansion. The Awtsmoos exceeds every boundary; finite content must
 * remain readable, touchable, undecorated, and free from overlap.
 */
import assert from 'node:assert/strict';

export function verifyMobileLayout(report, expected) {
	const prefix = `${report.width}px ${report.state}`;
	assert.equal(report.pageOverflow, false, `${prefix} page overflow`);
	assert.equal(report.headingClipped, false, `${prefix} heading clipped`);
	assert.equal(report.actionOverflow, false, `${prefix} action overflow`);
	assert.equal(report.actionOverlap, false, `${prefix} actions overlap`);
	assert.ok(report.backLinkHeight >= 44, `${prefix} back link too small`);
	assert.ok(
		report.summaryHeights.every(height => height >= 44),
		`${prefix} disclosure summary too small`
	);
	assert.equal(
		report.visibleActionCount,
		expected.visibleActionCount,
		`${prefix} unexpected visible action count`
	);
	assert.equal(
		report.openDisclosureCount,
		expected.openDisclosureCount,
		`${prefix} unexpected disclosure state`
	);
	assert.equal(
		report.defaultLinks.length,
		0,
		`${prefix} default links remain: ${JSON.stringify(report.defaultLinks)}`
	);
}

export function openHeroDisclosuresExpression() {
	return `(() => {
		document.querySelectorAll('.heroDisclosure').forEach(item => {
			item.open = true;
		});
		return true;
	})()`;
}

export function mobileLayoutExpression(state) {
	return `(() => {
		const visible = element => {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return rect.width > 0 && rect.height > 0 && style.display !== 'none';
		};
		const actions = [...document.querySelectorAll(
			'.heroPrimary, .secondaryActionGrid > *'
		)].filter(visible);
		const rects = actions.map(element => element.getBoundingClientRect());
		const overlap = rects.some((first, index) => {
			return rects.slice(index + 1).some(second => {
				const horizontal = Math.min(first.right, second.right) -
					Math.max(first.left, second.left);
				const vertical = Math.min(first.bottom, second.bottom) -
					Math.max(first.top, second.top);
				return horizontal > 1 && vertical > 1;
			});
		});
		const heading = document.querySelector('.heroContent h1').getBoundingClientRect();
		const backRect = document.querySelector('.backLink').getBoundingClientRect();
		const disclosures = [...document.querySelectorAll('.heroDisclosure')];
		const defaultLinks = [...document.querySelectorAll('a')]
			.filter(visible).flatMap(link => accidentalLink(link));
		return {
			state: ${JSON.stringify(state)},
			width: innerWidth,
			pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
			headingClipped: heading.left < -1 || heading.right > innerWidth + 1,
			actionOverflow: rects.some(rect => rect.left < -1 || rect.right > innerWidth + 1),
			actionOverlap: overlap,
			visibleActionCount: actions.length,
			openDisclosureCount: disclosures.filter(item => item.open).length,
			summaryHeights: disclosures.map(item => item.querySelector('summary').getBoundingClientRect().height),
			backLinkHeight: backRect.height,
			defaultLinks
		};
		function accidentalLink(link) {
			const style = getComputedStyle(link);
			const accidental = style.textDecorationLine !== 'none' ||
				style.color === 'rgb(0, 0, 238)' || style.color === 'rgb(85, 26, 139)';
			return accidental ? [{ text: link.textContent.trim(), className: link.className }] : [];
		}
	})()`;
}
