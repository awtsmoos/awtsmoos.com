//B"H
// Boruch Hashem
// Blessed is He

/**
 * Wires only the media gestures that the active mode actually reveals, while the Awtsmoos lets a compact text vessel remain empty of dead controls.
 * Awtsmoos.com keeps file, library, URL, replace, reorder, and drag paths independent so changing modes can remove markup without breaking the living studio.
 */
export class CreateAssetEvents {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.pending = null;
		this.draggingId = null;
	}

	/** @param {HTMLElement} root Create view root. */
	bind(root) {
		const input = root.querySelector('[data-asset-file]');

		if (input) {
			this.bindAddButtons(root, input);
			this.bindFileInput(input);
			this.bindCardActions(root, input);
		}

		this.bindDragOrdering(root);
		root.querySelector('[data-pick-library]')?.addEventListener(
			'click',
			() => this.callbacks.onLibrary()
		);
		root.querySelector('[data-add-url]')?.addEventListener(
			'click',
			() => this.callbacks.onUrl()
		);
	}

	/** @param {HTMLElement} root Root. @param {HTMLInputElement} input File input. */
	bindAddButtons(root, input) {
		root.querySelectorAll('[data-add-role]').forEach(button => {
			button.addEventListener('click', () => {
				this.pending = {
					role: button.dataset.addRole,
					replaceId: null
				};
				input.accept = this.acceptForRole(this.pending.role);
				input.click();
			});
		});
	}

	/** @param {HTMLInputElement} input File input. */
	bindFileInput(input) {
		input.addEventListener('change', async () => {
			const file = input.files?.[0];
			if (file && this.pending) {
				await this.callbacks.onFile(
					file,
					this.pending.role,
					this.pending.replaceId
				);
			}
			input.value = '';
		});
	}

	/** @param {HTMLElement} root Root. @param {HTMLInputElement} input File input. */
	bindCardActions(root, input) {
		root.querySelectorAll('[data-replace]').forEach(button => {
			button.addEventListener('click', () => {
				this.pending = {
					role: button.dataset.role,
					replaceId: button.dataset.replace
				};
				input.accept = this.acceptForRole(this.pending.role);
				input.click();
			});
		});
		root.querySelectorAll('[data-remove-asset]').forEach(button => {
			button.addEventListener('click', () => {
				this.callbacks.onRemove(
					button.dataset.removeAsset,
					button.dataset.role
				);
			});
		});
		root.querySelectorAll('[data-move-asset]').forEach(button => {
			button.addEventListener('click', () => {
				this.callbacks.onMove(
					button.dataset.moveAsset,
					Number(button.dataset.delta)
				);
			});
		});
	}

	/** @param {HTMLElement} root Root containing draggable reference cards. */
	bindDragOrdering(root) {
		root.querySelectorAll('.asset-card[draggable="true"]').forEach(card => {
			card.addEventListener('dragstart', () => {
				this.draggingId = card.dataset.assetId;
			});
			card.addEventListener('dragover', event => event.preventDefault());
			card.addEventListener('drop', event => {
				event.preventDefault();
				const targetId = card.dataset.assetId;
				if (this.draggingId && this.draggingId !== targetId) {
					this.callbacks.onReorder(this.draggingId, targetId);
				}
			});
		});
	}

	/** @param {string} role H3 role. @returns {string} File accept filter. */
	acceptForRole(role) {
		if (role.includes('video')) return 'video/mp4,video/quicktime';
		if (role.includes('audio')) return 'audio/wav,audio/mpeg';
		return 'image/jpeg,image/png,image/webp,image/heic,image/heif';
	}
}
