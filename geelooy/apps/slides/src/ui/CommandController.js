//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CommandController
 * @description The Awtsmoos gathers many possible actions into a simple invitation; Awtsmoos.com keeps creation, slide ordering, layering, notes, sharing, and panel movement discoverable without duplicating mutation law.
 */
export class CommandController {
	constructor(root, dependencies) {
		this.root = root;
		Object.assign(this, dependencies);
		this.root.addEventListener('click', event => this.onClick(event));
		this.bindTitle();
	}

	async onClick(event) {
		const insertButton = event.target.closest('[data-insert]');
		if (insertButton) {
			this.insert(insertButton.dataset.insert);
			return;
		}
		const button = event.target.closest('[data-action]');
		if (!button) {
			return;
		}
		await this.runAction(button.dataset.action, button);
	}

	async runAction(action, button) {
		const actions = {
			'add-slide': () => this.store.addSlide(),
			'duplicate-slide': () => this.store.duplicateSlide(),
			'delete-slide': () => this.store.deleteSlide(),
			'move-slide-up': () => this.store.moveActiveSlide('up'),
			'move-slide-down': () => this.store.moveActiveSlide('down'),
			'duplicate-element': () => this.store.duplicateSelectedElement(),
			'delete-element': () => this.store.deleteSelectedElement(),
			'layer-front': () => this.store.moveSelectedElementLayer('front'),
			'layer-forward': () => this.store.moveSelectedElementLayer('forward'),
			'layer-backward': () => this.store.moveSelectedElementLayer('backward'),
			'layer-back': () => this.store.moveSelectedElementLayer('back'),
			'toggle-notes': () => this.toggleNotes(),
			undo: () => this.store.undo(),
			redo: () => this.store.redo(),
			present: () => this.player.open(),
			'toggle-left': () => this.panels.toggle('left', button),
			'toggle-right': () => this.panels.toggle('right', button),
			'pick-image': () => this.files.pickImage(),
			import: () => this.files.pickImport(),
			'download-json': () => this.files.downloadDeck(),
			'download-html': () => this.files.downloadHtml(),
			share: () => this.share()
		};
		const handler = actions[action];
		if (handler) {
			await handler();
		}
	}

	insert(kind) {
		if (kind === 'rect') {
			this.store.addElement('shape', { shape: 'rect' });
		} else if (kind === 'circle') {
			this.store.addElement('shape', {
				shape: 'circle',
				width: 24,
				height: 42
			});
		} else {
			this.store.addElement(kind);
		}
		this.panels.closeMobilePanels();
	}

	toggleNotes() {
		const notes = this.root.querySelector('.speaker-notes-panel');
		if (!notes) return;
		notes.open = !notes.open;
		if (notes.open) {
			notes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	async share() {
		try {
			await this.collaboration.share();
			this.toast.show('Share link copied');
		} catch (error) {
			console.error('Awtsmoos Slides sharing failed.', error);
			this.toast.show('Share link created');
		}
	}

	bindTitle() {
		const title = this.root.querySelector('[data-deck-title]');
		title.addEventListener('change', () => {
			this.store.commit('rename-deck', draft => {
				draft.title = title.value.trim() || 'Untitled revelation';
			});
		});
	}
}
