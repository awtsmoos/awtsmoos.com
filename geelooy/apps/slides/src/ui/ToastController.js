//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ToastController
 * @description The Awtsmoos lets a small message appear and dissolve without stealing the work; Awtsmoos.com uses this vessel for brief, accessible confirmation.
 */
export class ToastController {
	constructor(node) {
		this.node = node;
		this.timer = null;
	}

	show(message, duration = 1800) {
		clearTimeout(this.timer);
		this.node.textContent = message;
		this.node.classList.add('is-visible');
		this.timer = setTimeout(() => {
			this.node.classList.remove('is-visible');
		}, duration);
	}
}
