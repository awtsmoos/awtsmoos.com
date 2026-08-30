//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Renders the creator's assigned media while the Awtsmoos lets one reusable vessel keep its true image, video, audio, or frame identity.
 * Awtsmoos.com keeps visual composition apart from event wiring, so previews and role labels can evolve without tangling the creative current.
 */
export class CreateAssetTrayView {
	constructor() {
		this.previewUrls = new Map();
	}

	/** @param {Object} draft Current draft. @param {Array<Object>} assets Assigned assets. @returns {string} Tray markup. */
	render(draft, assets) {
		const cards = this.assignments(draft, assets)
			.map(item => this.card(item))
			.join('');
		const empty = '<div class="empty-card">No references selected</div>';

		return `
			<section class="creator-section">
				<div class="section-heading">
					<div><span class="eyebrow">References</span><h2>Reusable material</h2></div>
					<button class="text-button" data-pick-library>Library</button>
				</div>
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
		if (mode === 'reference') {
			return `
				<button class="asset-add" data-add-role="reference_image">+ Image</button>
				<button class="asset-add" data-add-role="reference_video">+ Video</button>
				<button class="asset-add" data-add-role="reference_audio">+ Audio</button>
				<button class="asset-add subtle" data-add-url>+ Public URL</button>`;
		}
		return '<p class="tray-empty">Text mode uses your prompt only. Switch modes to add references.</p>';
	}

	/** @param {Object} draft Draft. @param {Array<Object>} assets Assigned assets. @returns {Array<Object>} Role-aware items. */
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

	/** @param {Array<Object>} result Items. @param {Map} byId Asset map. @param {string} id Asset ID. @param {string} role Frame role. */
	addFrame(result, byId, id, role) {
		if (id && byId.has(id)) {
			result.push({ asset: byId.get(id), role });
		}
	}

	/** @param {Object} item Role-aware asset. @returns {string} Card markup. */
	card(item) {
		const asset = item.asset;
		const draggable = item.role.startsWith('reference_');
		return `
			<article class="asset-card" draggable="${draggable}" data-asset-id="${asset.id}">
				${this.preview(asset)}
				<div class="asset-card-copy">
					<strong>${Dom.escape(asset.name)}</strong>
					<span>${Dom.escape(item.role.replaceAll('_', ' '))} · ${Dom.bytes(asset.size)}</span>
				</div>
				<div class="asset-card-actions">
					<button data-move-asset="${asset.id}" data-delta="-1" aria-label="Move earlier">↑</button>
					<button data-move-asset="${asset.id}" data-delta="1" aria-label="Move later">↓</button>
					<button data-replace="${asset.id}" data-role="${item.role}">Replace</button>
					<button data-remove-asset="${asset.id}" data-role="${item.role}">Remove</button>
				</div>
			</article>`;
	}

	/** @param {Object} asset Asset. @returns {string} Media preview markup. */
	preview(asset) {
		let url = asset.sourceUrl || this.previewUrls.get(asset.id);
		if (!url && asset.blob) {
			url = URL.createObjectURL(asset.blob);
			this.previewUrls.set(asset.id, url);
		}
		if (asset.kind === 'image' && url) return `<img class="asset-preview" src="${Dom.escape(url)}" alt="">`;
		if (asset.kind === 'video' && url) return `<video class="asset-preview" src="${Dom.escape(url)}" muted preload="metadata"></video>`;
		return '<div class="asset-preview asset-audio">AUDIO</div>';
	}
}
