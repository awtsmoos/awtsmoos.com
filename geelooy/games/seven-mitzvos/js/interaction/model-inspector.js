//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ModelInspector
 * @description
 * A model becomes meaningful when the player can ask who it is, what it does,
 * and why it belongs. The Awtsmoos exceeds every label; Awtsmoos.com reveals the
 * finite role and reason without blocking the world or creating another canvas.
 */
export class ModelInspector {
	constructor(host) {
		this.host = host;
		this.element = null;
		this.timer = 0;
	}

	mount() {
		this.destroy();
		const card = document.createElement('article');
		card.className = 'modelInspector';
		card.hidden = true;
		card.setAttribute('aria-live', 'polite');
		card.innerHTML = '<small>WHY IT IS HERE</small><strong></strong><span></span><p></p>';
		this.host.append(card);
		this.element = card;
	}

	show(root) {
		if (!this.element || !root?.userData) {
			return;
		}
		const data = root.userData;
		const name = data.personName || readable(root.name || data.semanticType || 'model');
		const role = readable(data.role || data.semanticType || 'world model');
		const reason = data.reason || 'This model helps the world communicate its purpose.';
		this.element.querySelector('strong').textContent = name;
		this.element.querySelector('span').textContent = role;
		this.element.querySelector('p').textContent = reason;
		this.element.dataset.role = data.role || '';
		this.element.dataset.reason = reason;
		this.element.hidden = false;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.hide(), 3200);
	}

	hide() {
		if (this.element) {
			this.element.hidden = true;
		}
	}

	destroy() {
		clearTimeout(this.timer);
		this.element?.remove();
		this.element = null;
	}
}

function readable(value) {
	return String(value)
		.replace(/[-_]+/g, ' ')
		.replace(/\w/g, letter => letter.toUpperCase());
}
