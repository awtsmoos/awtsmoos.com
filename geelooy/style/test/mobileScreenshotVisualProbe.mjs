//B"H
// Boruch Hashem
// Blessed is He
/** Reads visual failure signals the earlier structural audit could not see. */
export const homeProbe = `(() => {
	const dock = document.querySelector('.mobile-dock');
	const media = document.querySelector('.shliach-spotlight-image-link');
	const fallback = document.querySelector('.shliach-spotlight-media-fallback');
	const broken = [...document.images].filter(img => !img.hidden && img.complete && img.naturalWidth === 0);
	return {
		overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
		brokenImages: broken.length,
		mediaState: media?.dataset.mediaState || '',
		mediaHeight: media?.getBoundingClientRect().height || 0,
		fallbackVisible: fallback ? getComputedStyle(fallback).display !== 'none' && !fallback.hidden : false,
		bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
		dockHeight: dock?.getBoundingClientRect().height || 0
	};
})()`;

export const appsProbe = `(() => {
	const bodyStyle = getComputedStyle(document.body);
	const page = document.querySelector('.g-page');
	const dock = document.querySelector('.g-dock');
	const icons = [...document.querySelectorAll('[data-future-icon]')].filter(el => el.getClientRects().length);
	const defaultLinks = [...document.querySelectorAll('a')].filter(a => {
		if (!a.getClientRects().length) return false;
		const color = getComputedStyle(a).color;
		return color === 'rgb(85, 26, 139)' || color === 'rgb(0, 0, 238)';
	});
	return {
		overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
		background: bodyStyle.backgroundColor,
		fontFamily: bodyStyle.fontFamily,
		defaultLinks: defaultLinks.length,
		maxIconWidth: Math.max(0, ...icons.map(el => el.getBoundingClientRect().width)),
		maxIconHeight: Math.max(0, ...icons.map(el => el.getBoundingClientRect().height)),
		pagePaddingBottom: page ? parseFloat(getComputedStyle(page).paddingBottom) || 0 : 0,
		dockHeight: dock?.getBoundingClientRect().height || 0,
		integrityLoaded: [...document.styleSheets].some(sheet => String(sheet.href || '').includes('/apps/styles/integrity.css'))
	};
})()`;

export const gamesProbe = `(() => {
	const header = document.querySelector('.g-unusual-header');
	const dock = document.querySelector('.g-dock');
	const shell = document.querySelector('.gamesShell');
	const hero = document.querySelector('.heroPanel');
	const skipRect = document.querySelector('.skipLink')?.getBoundingClientRect();
	const filtered = [...document.querySelectorAll('[data-future-reveal]')].filter(el => getComputedStyle(el).filter !== 'none');
	return {
		overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
		filteredReveals: filtered.length,
		skipVisibleAtRest: Boolean(skipRect && skipRect.right > 0 && skipRect.left < innerWidth),
		headerBottom: header?.getBoundingClientRect().bottom || 0,
		heroTop: hero?.getBoundingClientRect().top || 0,
		shellPaddingBottom: shell ? parseFloat(getComputedStyle(shell).paddingBottom) || 0 : 0,
		dockHeight: dock?.getBoundingClientRect().height || 0,
		headerBackdrop: header ? getComputedStyle(header).backdropFilter : '',
		dockBackdrop: dock ? getComputedStyle(dock).backdropFilter : '',
		integrityLoaded: [...document.styleSheets].some(sheet => String(sheet.href || '').includes('/games/styles/integrity.css'))
	};
})()`;
