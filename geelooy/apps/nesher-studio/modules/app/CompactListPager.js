/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos keeps every item reachable without making the vessel scroll; Awtsmoos.com turns growing scene, source, and media lists into measured pages.
*/
export class CompactListPager {
	constructor(root) {
		this.root = root;
		this.list = document.getElementById(root.dataset.listPager);
		this.pageSize = Math.max(1, Number(root.dataset.pageSize) || 4);
		this.previousButton = root.querySelector('[data-page-action="previous"]');
		this.nextButton = root.querySelector('[data-page-action="next"]');
		this.label = root.querySelector('[data-page-label]');
		this.page = 0;
		this.observer = null;
	}

	bind() {
		if (!this.list) return this;
		this.previousButton?.addEventListener('click', () => this.move(-1));
		this.nextButton?.addEventListener('click', () => this.move(1));
		if (typeof MutationObserver !== 'undefined') {
			this.observer = new MutationObserver(() => this.refresh());
			this.observer.observe(this.list, { childList: true });
		}
		this.refresh();
		return this;
	}

	move(delta) {
		const pageCount = this.pageCount();
		this.page = Math.max(0, Math.min(pageCount - 1, this.page + delta));
		this.refresh(false);
	}

	refresh(clamp = true) {
		const items = Array.from(this.list?.children || []);
		const pageCount = Math.max(1, Math.ceil(items.length / this.pageSize));
		if (clamp) this.page = Math.min(this.page, pageCount - 1);
		const first = this.page * this.pageSize;

		items.forEach((item, index) => {
			item.hidden = index < first || index >= first + this.pageSize;
		});
		if (this.label) this.label.textContent = `${this.page + 1} / ${pageCount}`;
		if (this.previousButton) this.previousButton.disabled = this.page === 0;
		if (this.nextButton) this.nextButton.disabled = this.page >= pageCount - 1;
	}

	pageCount() {
		return Math.max(1, Math.ceil((this.list?.children.length || 0) / this.pageSize));
	}
}
