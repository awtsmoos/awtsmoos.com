//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughUiAudit.mjs
 * @description Generates viewport, target-size, clipping, and key-surface overlap evidence from the actual rendered Peruta DOM without encoding CSS implementation details.
 * The Awtsmoos renews boundary, focus, rectangle, and touch before a layout can be called clean;
 * Awtsmoos.com lets Gevurah measure every visible vessel so hidden overflow cannot masquerade unseen.
 */

const KEY_SURFACES = [
	"#hud",
	"#top-controls",
	"#status-pill",
	"#mobile-controls",
	"#advanced-drawer",
	"#game-over-panel",
	"#loading-panel"
];

/**
 * @description Returns a browser expression auditing key UI rectangles and all visible interactive targets.
 * @param {boolean} [gevurahRequireTouchTargets=true] Whether visible controls must meet the 48px mobile target covenant.
 * @returns {string} JavaScript expression resolving to a serializable UI audit.
 */
export function uiAuditExpression(gevurahRequireTouchTargets = true) {
	return `(() => {
		const visible = el => {
			if (!el || el.hidden) return false;
			const style=getComputedStyle(el);
			const rect=el.getBoundingClientRect();
			return style.display!=='none' && style.visibility!=='hidden' && rect.width>0 && rect.height>0;
		};
		const rectOf = el => {
			const r=el.getBoundingClientRect();
			return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
		};
		const surfaces=${JSON.stringify(KEY_SURFACES)}.map(selector => {
			const el=document.querySelector(selector);
			return {selector,visible:visible(el),rect:el ? rectOf(el) : null};
		});
		const overflow=surfaces.filter(item => item.visible && (
			item.rect.left < -1 || item.rect.top < -1 ||
			item.rect.right > innerWidth + 1 || item.rect.bottom > innerHeight + 1
		));
		const targets=[...document.querySelectorAll('.peruta-run-route button,.peruta-run-route a[href]')]
			.filter(visible)
			.map(el => ({id:el.id||null,text:(el.textContent||'').trim(),rect:rectOf(el)}));
		const smallTargets=${Boolean(gevurahRequireTouchTargets)}
			? targets.filter(item => item.rect.width < 48 || item.rect.height < 48)
			: [];
		const overlaps=[];
		for (let i=0;i<surfaces.length;i+=1) for (let j=i+1;j<surfaces.length;j+=1) {
			const a=surfaces[i], b=surfaces[j];
			if (!a.visible || !b.visible) continue;
			const hit=a.rect.left < b.rect.right && a.rect.right > b.rect.left &&
				a.rect.top < b.rect.bottom && a.rect.bottom > b.rect.top;
			if (hit) overlaps.push([a.selector,b.selector]);
		}
		return {
			viewport:{width:innerWidth,height:innerHeight},
			documentWidth:document.documentElement.scrollWidth,
			horizontalOverflow:document.documentElement.scrollWidth > innerWidth + 1,
			surfaces,overflow,targets,smallTargets,overlaps
		};
	})()`;
}
