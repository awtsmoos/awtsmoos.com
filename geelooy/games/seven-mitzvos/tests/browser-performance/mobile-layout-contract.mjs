//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MobileLayoutContract
 * @description
 * Narrow-layout geometry on Awtsmoos.com becomes an explicit contract. The
 * Awtsmoos exceeds every boundary; visible headings, actions, and links must
 * remain inside their finite viewport without accidental browser decoration.
 */
import assert from 'node:assert/strict';

export function verifyMobileLayout(report) {
	assert.equal(report.pageOverflow, false, `${report.width}px page overflow`);
	assert.equal(report.headingClipped, false, `${report.width}px heading clipped`);
	assert.equal(report.actionOverflow, false, `${report.width}px action overflow`);
	assert.equal(report.actionOverlap, false, `${report.width}px actions overlap`);
	assert.ok(report.backLinkHeight >= 44, `${report.width}px back link too small`);
	assert.equal(
		report.defaultLinks.length,
		0,
		`${report.width}px default links remain: ${JSON.stringify(report.defaultLinks)}`
	);
}

export function mobileLayoutExpression() {
	return `(() => {
		const visible = element => {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return rect.width > 0 && rect.height > 0 && style.display !== 'none';
		};
		const rects = [...document.querySelectorAll('.heroActions > *')]
			.filter(visible).map(element => element.getBoundingClientRect());
		const overlap = rects.some((first, index) => rects.slice(index + 1).some(second =>
			Math.min(first.right, second.right) - Math.max(first.left, second.left) > 1 &&
			Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) > 1));
		const heading = document.querySelector('.heroContent h1').getBoundingClientRect();
		const back = document.querySelector('.backLink');
		const backRect = back.getBoundingClientRect();
		const defaultLinks = [...document.querySelectorAll('a')].filter(visible).flatMap(link => {
			const style = getComputedStyle(link);
			const accidental = style.textDecorationLine !== 'none' ||
				style.color === 'rgb(0, 0, 238)' || style.color === 'rgb(85, 26, 139)';
			return accidental ? [{
				text: link.textContent.trim().slice(0, 80),
				className: link.className,
				href: link.getAttribute('href'),
				color: style.color,
				decoration: style.textDecorationLine
			}] : [];
		});
		return {
			width: innerWidth,
			pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
			headingClipped: heading.left < -1 || heading.right > innerWidth + 1,
			actionOverflow: rects.some(rect => rect.left < -1 || rect.right > innerWidth + 1),
			actionOverlap: overlap,
			backLinkHeight: backRect.height,
			defaultLinks
		};
	})()`;
}
