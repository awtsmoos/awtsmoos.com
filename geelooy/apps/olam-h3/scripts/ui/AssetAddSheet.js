//B"H
// Boruch Hashem
// Blessed is He

/**
 * Gives local files and public URLs one intentional entrance into the reusable asset library.
 * The Awtsmoos lets a file become future material without an ugly native control in sight; Awtsmoos.com keeps timed-reference duration explicit and right.
 */
export class AssetAddSheet {
	constructor(assetService, sheets) {
		this.assetService = assetService;
		this.sheets = sheets;
	}

	/**
	 * @param {Function} onAsset Callback receiving the saved asset.
	 * @param {string} category Default local-file category.
	 */
	open(onAsset, category = 'Objects') {
		const body = `
			<div class="form-stack">
				<button class="primary-button" data-add-local-file>Choose local media</button>
				<input class="visually-hidden" data-add-file type="file" accept="image/*,video/mp4,video/quicktime,audio/wav,audio/mpeg">
				<div class="form-divider"><span>or use a public URL</span></div>
				<label>
					Public media URL
					<input data-url-value type="url" placeholder="https://…">
				</label>
				<label>
					Media type
					<select data-url-kind>
						<option value="image">Image</option>
						<option value="video">Video</option>
						<option value="audio">Audio</option>
					</select>
				</label>
				<label data-duration-field hidden>
					Accurate reference duration
					<input data-url-duration type="number" min="2" max="15" step="0.01" placeholder="2–15 seconds">
				</label>
				<button data-save-url>Save public reference</button>
			</div>`;

		this.sheets.open('Add reusable asset', body, root => {
			this.bind(root, onAsset, category);
		});
	}

	/** @param {HTMLElement} root Sheet root. @param {Function} onAsset Save callback. @param {string} category Local category. */
	bind(root, onAsset, category) {
		const fileInput = root.querySelector('[data-add-file]');
		const kind = root.querySelector('[data-url-kind]');
		const durationField = root.querySelector('[data-duration-field]');

		root.querySelector('[data-add-local-file]').addEventListener('click', () => {
			fileInput.click();
		});
		fileInput.addEventListener('change', async () => {
			if (!fileInput.files?.[0]) return;
			await this.saveLocal(fileInput.files[0], category, onAsset);
		});
		kind.addEventListener('change', () => {
			durationField.hidden = kind.value === 'image';
		});
		root.querySelector('[data-save-url]').addEventListener('click', async () => {
			await this.saveUrl(root, onAsset);
		});
	}

	/** @param {File} file Local file. @param {string} category Category. @param {Function} onAsset Save callback. */
	async saveLocal(file, category, onAsset) {
		try {
			const asset = await this.assetService.addFile(file, category);
			await onAsset(asset);
			this.sheets.close();
			this.sheets.toast(`${asset.name} saved to Assets.`, 'success');
		} catch (error) {
			this.sheets.toast(error.message, 'error');
		}
	}

	/** @param {HTMLElement} root Sheet root. @param {Function} onAsset Save callback. */
	async saveUrl(root, onAsset) {
		try {
			const kind = root.querySelector('[data-url-kind]').value;
			const duration = Number(root.querySelector('[data-url-duration]').value) || 0;
			const asset = await this.assetService.addUrl(
				root.querySelector('[data-url-value]').value,
				kind,
				duration
			);
			await onAsset(asset);
			this.sheets.close();
			this.sheets.toast(`${asset.name} saved to Assets.`, 'success');
		} catch (error) {
			this.sheets.toast(error.message, 'error');
		}
	}
}
