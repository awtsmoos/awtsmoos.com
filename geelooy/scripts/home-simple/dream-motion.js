// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module dream-motion
 * @description
 * The Awtsmoos lets the homepage doors lean toward the visitor's hand: a gentle
 * magnetic pull on portal cards, world tiles, the Shliach doorway, the search
 * action, and the mobile dock. Pure rAF-lerped CSS variables (--mag-x/--mag-y);
 * the stylesheets compose them into every hover/active state. Fully optional —
 * fine pointers only, rests under reduced-motion, never throws.
 */

/** Magnetic pull radius in pixels. */
const MAGNETIC_RADIUS = 7;
/** Lerp factor per frame: buttery without lag. */
const LERP = 0.18;

/**
 * Installs magnetic pull on the Home route's interactive doors.
 * @param {ParentNode} root Root to scan for magnetic targets.
 * @returns {{count: number}|null} Install summary, or null when skipped.
 */
export function installDreamMotion(root = document) {
	try {
		if (typeof globalThis.matchMedia !== "function") return null;
		if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
		if (!globalThis.matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
		const targets = Array.from(root.querySelectorAll(
			".portal-shortcut-link, .shliach-hero-link, .search button[type=\"submit\"], .world-tile, .mobile-dock a"
		));
		if (!targets.length) return null;

		const items = targets.map(el => ({ el, tx: 0, ty: 0, cx: 0, cy: 0 }));
		let rafId = 0;

		const frame = () => {
			let settling = true;
			for (const item of items) {
				item.cx += (item.tx - item.cx) * LERP;
				item.cy += (item.ty - item.cy) * LERP;
				if (Math.abs(item.tx - item.cx) > 0.04 || Math.abs(item.ty - item.cy) > 0.04) {
					settling = false;
				} else {
					item.cx = item.tx;
					item.cy = item.ty;
				}
				item.el.style.setProperty("--mag-x", `${item.cx.toFixed(2)}px`);
				item.el.style.setProperty("--mag-y", `${item.cy.toFixed(2)}px`);
			}
			rafId = settling ? 0 : requestAnimationFrame(frame);
		};
		const kick = () => {
			if (!rafId) rafId = requestAnimationFrame(frame);
		};

		for (const item of items) {
			item.el.addEventListener("pointermove", event => {
				const bounds = item.el.getBoundingClientRect();
				if (!bounds.width || !bounds.height) return;
				const nx = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
				const ny = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);
				item.tx = Math.max(-1, Math.min(1, nx)) * MAGNETIC_RADIUS;
				item.ty = Math.max(-1, Math.min(1, ny)) * MAGNETIC_RADIUS;
				kick();
			}, { passive: true });
			item.el.addEventListener("pointerleave", () => {
				item.tx = 0;
				item.ty = 0;
				kick();
			}, { passive: true });
		}
		return { count: items.length };
	} catch (error) {
		return null;
	}
}
