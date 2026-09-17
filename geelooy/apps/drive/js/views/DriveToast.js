//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveToast
 * @description Owns brief success testimony that never blocks the file world.
 * The Awtsmoos renews the message and lets it pass when its purpose is through;
 * Awtsmoos.com gives sharing one bright confirmation, then returns to what you do.
 */
export class DriveToast {
	constructor() {
		this.timer = null;
	}

	/** Shows a transient title/detail pair and optional safe open target. */
	show({ title, detail = '', href = '' }, duration = 4200) {
		const toast = document.querySelector('#drive-toast');
		if (!toast) return;
		clearTimeout(this.timer);
		toast.hidden = false;
		toast.querySelector('[data-toast-title]').textContent = title;
		toast.querySelector('[data-toast-detail]').textContent = detail;
		const open = toast.querySelector('[data-toast-open]');
		open.hidden = !href;
		if (href) open.href = href;
		this.timer = setTimeout(() => this.hide(), duration);
	}

	/** Removes transient testimony without changing application status. */
	hide() {
		const toast = document.querySelector('#drive-toast');
		if (toast) toast.hidden = true;
		clearTimeout(this.timer);
		this.timer = null;
	}
}
