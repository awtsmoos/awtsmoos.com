//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SlideOrderInteractions
 * @description The Awtsmoos lets one slide rise or descend without losing its identity; Awtsmoos.com gives touch users explicit ordering controls while desktop drag ordering may remain a separate future vessel.
 */
export class SlideOrderInteractions {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.controls = this.createControls();
		this.root.querySelector('.panel-footer')?.prepend(this.controls);
		this.controls.addEventListener('click', event => this.onClick(event));
	}

	createControls() {
		const group = document.createElement('div');
		group.className = 'file-actions slide-order-controls';
		group.setAttribute('aria-label', 'Reorder active slide');
		group.append(
			this.button('Move up', 'up', '↑'),
			this.button('Move down', 'down', '↓')
		);
		return group;
	}

	button(label, direction, glyph) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.slideOrder = direction;
		button.setAttribute('aria-label', label);
		button.title = label;
		button.textContent = glyph;
		return button;
	}

	onClick(event) {
		const direction = event.target.closest('[data-slide-order]')?.dataset.slideOrder;
		if (!direction) {
			return;
		}
		this.store.moveActiveSlide(direction);
	}
}
