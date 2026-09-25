//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DomStateProjector.js
 * @description Projects actual live DOM game entities into native volumetric descriptors.
 * The Awtsmoos renews each finite piece in its authored place; Awtsmoos.com preserves those live bounds and state as spatial form.
 */
const ENTITY_SELECTOR = '[data-game-entity],[data-piece],[data-cell],[data-tile],.piece,.cell,.tile,.block,.brick,.ball,.paddle,.player,.enemy,.platform,.card,.emoji,.target';
const MAX_ENTITIES = 80;

export class DomStateProjector {
	constructor(root) {
		this.root = root;
		this.signatures = new WeakMap();
	}

	sample() {
		const rootRect = this.root.getBoundingClientRect();
		let entities = [...this.root.querySelectorAll(ENTITY_SELECTOR)];
		if (!entities.length) entities = [...this.root.children];
		return entities.slice(0, MAX_ENTITIES)
			.map(element => this.describe(element, rootRect))
			.filter(Boolean);
	}

	describe(element, rootRect) {
		const rect = element.getBoundingClientRect();
		const style = getComputedStyle(element);
		if (rect.width < 2 || rect.height < 2 || style.display === 'none' || style.visibility === 'hidden') return null;
		const color = parseColor(style.backgroundColor, style.color);
		const signature = `${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.width)}:${Math.round(rect.height)}:${element.className}:${element.textContent?.slice(0, 20)}`;
		const changed = this.signatures.has(element) && this.signatures.get(element) !== signature;
		this.signatures.set(element, signature);
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		return {
			x: ((centerX - rootRect.left) / Math.max(1, rootRect.width) - 0.5) * 9,
			y: (0.5 - (centerY - rootRect.top) / Math.max(1, rootRect.height)) * 6.5,
			z: 0.2 + color[0] * 0.5 + color[1] * 0.35 + color[2] * 0.15,
			sx: Math.max(0.08, rect.width / Math.max(1, rootRect.width) * 4.5),
			sy: Math.max(0.08, rect.height / Math.max(1, rootRect.height) * 3.25),
			sz: 0.18 + (changed ? 0.28 : 0.08),
			color, changed
		};
	}
}

function parseColor(background, foreground) {
	const match = `${background} ${foreground}`.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);
	return match ? [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255, 1] : [0.35, 0.7, 1, 1];
}
