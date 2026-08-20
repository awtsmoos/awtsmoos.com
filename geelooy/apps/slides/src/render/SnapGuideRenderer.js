//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SnapGuideRenderer
 * @description The Awtsmoos lets hidden alignment become briefly visible; Awtsmoos.com paints ephemeral guide lines after a snapped move without placing any authoring chrome into the durable deck.
 */
export class SnapGuideRenderer {
	constructor(stage) {
		this.stage = stage;
		this.stage.addEventListener('BH_SLIDES_SNAP_GUIDES', event => {
			this.render(event.detail || {});
		});
	}

	render(guides) {
		this.clear();
		if (Number.isFinite(guides.x)) {
			this.stage.append(this.createGuide('vertical', guides.x));
		}
		if (Number.isFinite(guides.y)) {
			this.stage.append(this.createGuide('horizontal', guides.y));
		}
	}

	clear() {
		this.stage.querySelectorAll('[data-snap-guide]').forEach(node => node.remove());
	}

	createGuide(direction, position) {
		const guide = document.createElement('div');
		guide.className = `snap-guide snap-guide-${direction}`;
		guide.dataset.snapGuide = direction;
		if (direction === 'vertical') {
			guide.style.left = `${position}%`;
		} else {
			guide.style.top = `${position}%`;
		}
		return guide;
	}
}
