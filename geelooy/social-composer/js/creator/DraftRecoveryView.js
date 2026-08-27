//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class DraftRecoveryView
 * @description
 * The Awtsmoos lets former forms of one unfinished thought remain reachable without crowding the present page;
 * Awtsmoos.com reveals recent versions in a thumb-friendly sheet, keeping recovery quiet until the writer asks the age.
 */
export class DraftRecoveryView {
	constructor(root = document) {
		this.root = root;
	}

	mount({ onOpen, onRestore, onClear }) {
		if (this.root.getElementById('draftRecoveryDialog')) return false;
		this.button = this.root.createElement('button');
		this.button.type = 'button';
		this.button.className = 'draftVersionsButton civilization-button';
		this.button.textContent = 'Versions';
		this.button.addEventListener('click', onOpen);
		const preview = this.root.getElementById('mobilePreviewButton');
		preview?.before(this.button);
		this.dialog = this.root.createElement('dialog');
		this.dialog.id = 'draftRecoveryDialog';
		this.dialog.className = 'draftRecoveryDialog';
		this.dialog.innerHTML = [
			'<div class="draftRecoveryHandle" aria-hidden="true"></div>',
			'<header><div><span>Local memory</span><h2>Recent versions</h2></div><button type="button" data-recovery-close>Close</button></header>',
			'<p class="draftRecoveryHint">Uploaded media is preserved. Temporary local file bytes are never written into version history.</p>',
			'<div class="draftRecoveryList" data-recovery-list></div>',
			'<footer><button type="button" data-recovery-clear>Clear version history</button></footer>'
		].join('');
		this.dialog.querySelector('[data-recovery-close]').addEventListener('click', () => this.close());
		this.dialog.querySelector('[data-recovery-clear]').addEventListener('click', onClear);
		this.dialog.addEventListener('click', event => {
			const restore = event.target.closest('[data-restore-version]');
			if (restore) onRestore(restore.dataset.restoreVersion);
		});
		this.root.body.append(this.dialog);
		return true;
	}

	render(records = []) {
		const list = this.dialog?.querySelector('[data-recovery-list]');
		if (!list) return;
		list.replaceChildren();
		if (!records.length) {
			const empty = this.root.createElement('p');
			empty.className = 'draftRecoveryEmpty';
			empty.textContent = 'No saved versions yet. Autosave will create them as the draft changes.';
			list.append(empty);
			return;
		}
		for (const record of records) list.append(this.card(record));
	}

	card(record) {
		const article = this.root.createElement('article');
		article.className = 'draftRecoveryCard';
		const text = this.root.createElement('div');
		const title = this.root.createElement('strong');
		title.textContent = record.label;
		const time = this.root.createElement('time');
		time.dateTime = new Date(record.savedAt).toISOString();
		time.textContent = new Date(record.savedAt).toLocaleString();
		text.append(title, time);
		const button = this.root.createElement('button');
		button.type = 'button';
		button.dataset.restoreVersion = record.id;
		button.textContent = 'Restore';
		article.append(text, button);
		return article;
	}

	open() {
		if (typeof this.dialog?.showModal === 'function') this.dialog.showModal();
		else this.dialog?.setAttribute('open', '');
	}

	close() {
		if (typeof this.dialog?.close === 'function') this.dialog.close();
		else this.dialog?.removeAttribute('open');
	}

	isOpen() {
		return Boolean(this.dialog?.open);
	}
}
