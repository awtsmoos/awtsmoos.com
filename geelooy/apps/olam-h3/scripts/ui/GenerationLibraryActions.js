//B"H
// Boruch Hashem
// Blessed is He

import { GenerationDetailsView } from './GenerationDetailsView.js';
import { GenerationMediaActions } from './GenerationMediaActions.js';

/**
 * Turns a saved generation into a reusable creative ancestor while media-specific work flows through its own smaller vessel.
 * The Awtsmoos lets prompt, references, result, and favorite state remain connected; Awtsmoos.com keeps history useful without one class swallowing every action intended.
 */
export class GenerationLibraryActions {
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.media = new GenerationMediaActions(dependencies);
	}

	/** @param {string} id Generation ID to reveal in a detail sheet. */
	async open(id) {
		const generation = await this.repositories.get('generations', id);
		if (!generation) {
			return;
		}

		const playable = await this.videoCache.playable(generation);
		const body = GenerationDetailsView.render(generation, playable);
		this.sheets.open('Creation details', body, root => {
			root.querySelectorAll('[data-detail-action]').forEach(button => {
				button.addEventListener('click', () => {
					this.perform(
						button.dataset.detailAction,
						generation
					);
				});
			});
		});
	}

	/** @param {string} action Detail action. @param {Object} generation Saved generation. */
	async perform(action, generation) {
		if (action === 'prompt') {
			this.composer.draft.prompt = generation.prompt;
			this.navigateCreate();
			return;
		}
		if (action === 'refs') {
			this.restoreReferences(generation);
			this.navigateCreate();
			return;
		}
		if (action === 'build' || action === 'duplicate') {
			await this.composer.buildFrom(generation);
			this.sheets.close();
			return;
		}
		if (action === 'copy') {
			await navigator.clipboard.writeText(generation.prompt || '');
			this.sheets.toast('Prompt copied.', 'success');
			return;
		}
		if (action === 'reference-video') {
			await this.media.useAsReference(generation);
			return;
		}
		if (action === 'cache') {
			await this.media.cache(generation);
			return;
		}
		if (action === 'save') {
			await this.media.save(generation);
			return;
		}
		if (action === 'delete') {
			await this.remove(generation.id);
		}
	}

	/** @param {Object} generation Source generation. */
	restoreReferences(generation) {
		this.composer.draft.mode = generation.mode;
		this.composer.draft.referenceAssetIds = [
			...(generation.referenceAssetIds || [])
		];
		this.composer.draft.firstFrameAssetId = generation.firstFrameAssetId || null;
		this.composer.draft.lastFrameAssetId = generation.lastFrameAssetId || null;
	}

	/** Close details, navigate to Create, and redraw restored draft state. */
	navigateCreate() {
		this.sheets.close();
		this.composer.onNavigate('create');
		this.composer.refresh();
	}

	/** @param {string} id Generation ID to delete. */
	async remove(id) {
		this.queue.stop(id);
		await this.videoCache.remove(id);
		await this.repositories.remove('generations', id);
		this.sheets.close();
		await this.onRefresh();
	}

	/** @param {string} id Generation ID whose favorite state should toggle. */
	async toggleFavorite(id) {
		const item = await this.repositories.get('generations', id);
		if (!item) {
			return;
		}
		await this.repositories.put('generations', {
			...item,
			favorite: !item.favorite,
			updatedAt: Date.now()
		});
		await this.onRefresh();
	}
}
