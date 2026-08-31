//B"H
// Boruch Hashem
// Blessed is He

import { CreateAssignedAssetView } from './CreateAssignedAssetView.js';
import { CreateReferenceGuide } from './CreateReferenceGuide.js';
import { CreateReferenceRecipes } from './CreateReferenceRecipes.js';

/**
 * Reveals media controls only when they can help the active mode while the Awtsmoos lets irrelevant explanation fold away.
 * Awtsmoos.com keeps Text mode nearly weightless and lets Frames or References open the richer vessel only when chosen.
 */
export class CreateAssetTrayView {
	constructor() {
		this.assetView = new CreateAssignedAssetView();
	}

	/** @param {Object} draft Draft. @param {Array<Object>} assets Assets. @returns {string} Reference markup. */
	render(draft, assets) {
		if (draft.mode === 'text') {
			return `
				<section class="creator-section references-guide-only compact-reference-hint">
					<div><span class="eyebrow">Need tighter control?</span><p>Anchor frames, or guide character, motion, and sound with references.</p></div>
					<div class="reference-shortcuts"><button data-reference-recipe-mode="frames">Use frames</button><button data-reference-recipe-mode="reference">Use references</button></div>
				</section>`;
		}
		const cards = this.assignments(draft, assets)
			.map(assignment => this.assetView.render(assignment))
			.join('');
		const empty = '<div class="empty-card compact-empty">Nothing attached yet. Choose a recipe or add media below.</div>';
		return `
			<section class="creator-section references-section">
				<div class="section-heading"><div><span class="eyebrow">References</span><h2>${draft.mode === 'frames' ? 'Opening and ending' : 'Look, motion, and sound'}</h2></div><button class="text-button" data-pick-library>Library</button></div>
				${CreateReferenceGuide.render(draft.mode)}
				${CreateReferenceRecipes.render(draft.mode)}
				<div class="asset-tray">${cards || empty}</div>
				<div class="asset-add-row">${this.controls(draft.mode)}</div>
				<input class="visually-hidden" data-asset-file type="file" tabindex="-1">
			</section>`;
	}

	/** @param {string} mode Mode. @returns {string} Add controls. */
	controls(mode) {
		if (mode === 'frames') {
			return `<button class="asset-add" data-add-role="first_frame">+ First frame</button><button class="asset-add" data-add-role="last_frame">+ Last frame</button><button class="asset-add subtle" data-add-url>+ Public URL</button>`;
		}
		return `<button class="asset-add" data-add-role="reference_image">+ Image</button><button class="asset-add" data-add-role="reference_video">+ Video</button><button class="asset-add" data-add-role="reference_audio">+ Audio</button><button class="asset-add subtle" data-add-url>+ Public URL</button>`;
	}

	/** @param {Object} draft Draft. @param {Array<Object>} assets Assets. @returns {Array<Object>} Assignments. */
	assignments(draft, assets) {
		const byId = new Map(assets.map(asset => [asset.id, asset]));
		const result = draft.referenceAssetIds.map(id => byId.get(id)).filter(Boolean).map(asset => ({ asset, role: `reference_${asset.kind}` }));
		this.addFrame(result, byId, draft.firstFrameAssetId, 'first_frame');
		this.addFrame(result, byId, draft.lastFrameAssetId, 'last_frame');
		return result;
	}

	/** @param {Array<Object>} result Items. @param {Map} byId Assets. @param {string} id Asset ID. @param {string} role Role. */
	addFrame(result, byId, id, role) {
		if (id && byId.has(id)) {
			result.push({ asset: byId.get(id), role });
		}
	}
}
