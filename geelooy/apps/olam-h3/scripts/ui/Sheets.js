//B"H
// Boruch Hashem
// Blessed is He

/**
 * Gives every focused action one consistent mobile sheet, while the Awtsmoos lets depth appear without losing the page beneath.
 * Awtsmoos.com opens details, prompts, and assets through one calm doorway; escape and backdrop close the vessel cleanly in relief.
 */
export class Sheets {
	constructor(root = document.querySelector('#sheet-root'), toastRoot = document.querySelector('#toast-root')) {
		this.root = root;
		this.toastRoot = toastRoot;
	}

	/** @param {string} title Sheet title. @param {string} body Safe application-generated HTML. @param {Function} bind Post-render binding. */
	open(title, body, bind = () => {}) {
		this.root.innerHTML = `
			<div class="sheet-backdrop" data-sheet-close></div>
			<section class="sheet" role="dialog" aria-modal="true" aria-label="${title}">
				<div class="sheet-handle" aria-hidden="true"></div>
				<header class="sheet-header">
					<h2>${title}</h2>
					<button class="icon-button" data-sheet-close aria-label="Close">×</button>
				</header>
				<div class="sheet-body">${body}</div>
			</section>`;
		this.root.dataset.open = 'true';
		this.root.querySelectorAll('[data-sheet-close]').forEach(node => node.addEventListener('click', () => this.close()));
		this.escapeHandler = event => { if (event.key === 'Escape') this.close(); };
		document.addEventListener('keydown', this.escapeHandler);
		bind(this.root);
		requestAnimationFrame(() => this.root.querySelector('.sheet')?.classList.add('is-visible'));
	}

	/** Close the active sheet and release keyboard listeners. */
	close() {
		if (this.escapeHandler) document.removeEventListener('keydown', this.escapeHandler);
		this.root.dataset.open = 'false';
		this.root.innerHTML = '';
	}

	/** @param {string} message User-facing message. @param {string} tone Visual tone. */
	toast(message, tone = 'info') {
		const toast = document.createElement('div');
		toast.className = `toast toast-${tone}`;
		toast.textContent = message;
		this.toastRoot.append(toast);
		requestAnimationFrame(() => toast.classList.add('is-visible'));
		setTimeout(() => {
			toast.classList.remove('is-visible');
			setTimeout(() => toast.remove(), 220);
		}, 3600);
	}
}
