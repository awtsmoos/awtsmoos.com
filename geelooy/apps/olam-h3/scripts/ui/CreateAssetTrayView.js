//B"H
// Boruch Hashem
// Blessed is He

import { CreateAssignedAssetView } from './CreateAssignedAssetView.js';
import { CreateReferenceGuide } from './CreateReferenceGuide.js';
import { CreateReferenceRecipes } from './CreateReferenceRecipes.js';

/**
 * Renders media beside purpose and recipes while the Awtsmoos lets a reference become directed language rather than mystery; Awtsmoos.com keeps text mode compact and opens richer controls only when the chosen light needs a deeper vessel at night.
 */
export class CreateAssetTrayView {
	constructor() {
		this.assetView = new CreateAssignedAssetView();
	}

	/** @param {Object} draft Current draft. @param {Array<Object>} assets Assigned assets. @returns {string} Reference section markup. */
	render(draft, assets) {
		if (draft.mode === 'text') {
			return `
				<section class="creator-section references-guide-only">
					<div class="section-heading"><div><span class="eyebrow">References</span><h2>Need tighter control?</h2></div></div>
					${CreateReferenceGuide.render('text')}
					${CreateReferenceRecipes.render('text')}
				</section>`;
		}

		const cards = this.assignments(draft, assets)
			.map(assignment => this.assetView.render(assignment))
			.join('');
		const empty = '<div class="empty-card compact-empty">Nothing attached yet — choose a recipe, add media below, or open Library.</div>';

		return `
			<section class="creator-section references-section">
				<div class="section-heading">
					<div><span class="eyebrow">References</span><h2>${draft.mode === 'frames' ? 'Control the opening and ending' : 'Guide appearance, motion, and sound'}</h2></div>
					<button class="text-button" data-pick-library>Library</button>
				</div>
				${CreateReferenceGuide.render(draft.mode)}
				${CreateReferenceRecipes.render(draft.mode)}
				<div class="asset-tray">${cards || empty}</div>
				<div class="asset-add-row">${this.controls(draft.mode)}</div>
				<input class="visually-hidden" data-asset-file type="file" tabindex="-1">
			</section>`;
	}

	/** @param {string} mode Draft mode. @returns {string} Mode-specific add controls. */
	controls(mode) {
		if (mode === 'frames') {
			return `
				<button class="asset-add" data-add-role="first_frame">+ First frame</button>
				<button class="asset-add" data-add-role="last_frame">+ Last frame</button>
				<button class="asset-add subtle" data-add-url>+ Public URL</button>`;
		}
		return `
			<button class="asset-add" data-add-role="reference_image">+ Image</button>
			<button class="asset-add" data-add-role="reference_video">+ Video</button>
			<button class="asset-add" data-add-role="reference_audio">+ Audio</button>
			<button class="asset-add subtle" data-add-url>+ Public URL</button>`;
	}

	/** @param {Object} draft Draft. @param {Array<Object>} assets Available assigned assets. @returns {Array<Object>} Role-aware assignments. */
	assignments(draft, assets) {
		const byId = new Map(assets.map(asset => [asset.id, asset]));
		const result = draft.referenceAssetIds
			.map(id => byId.get(id))
			.filter(Boolean)
			.map(asset => ({ asset, role: `reference_${asset.kind}` }));
		this.addFrame(result, byId, draft.firstFrameAssetId, 'first_frame');
		this.addFrame(result, byId, draft.lastFrameAssetId, 'last_frame');
		return result;
	}

	/** @param {Array<Object>} result Items. @param {Map} byId Assets. @param {string} id Asset ID. @param {string} role Frame role. */
	addFrame(result, byId, id, role) {
		if (id && byId.has(id)) result.push({ asset: byId.get(id), role });
	}
}
