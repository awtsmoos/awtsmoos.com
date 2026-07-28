// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleAssetLab
 * @description
 * Generation and import share one library. Every preset invocation receives a
 * distinct recorded identity while Awtsmoos.com inserts it at the playhead.
 */

import { addAssetToProject } from './NleAssetClipFactory.js';
import { createNleAssetCard } from './NleAssetCard.js';
import { createImportedAsset } from './NleAssetGenerators.js';
import { createNlePresetInstance } from './NleGeneratedAssetFactory.js';
import { NLE_ASSET_PRESETS } from './NleAssetPresets.js';

export class NleAssetLab {
	constructor({ root, state, repository }) {
		Object.assign(this, { root, state, repository });
		this.generationSequence = 1;
		this.mount();
	}

	mount() {
		this.root.innerHTML = /*html*/`
			<header class="nle-panel-heading"><div><small>Asset generation</small><h2>Library</h2></div><label class="nle-import-media">Import<input type="file" accept="image/*,video/*,audio/*" multiple></label></header>
			<div class="nle-generator-grid" data-nle-generators></div>
			<section class="nle-custom-title">
				<label><span>Title text</span><input data-nle-title-text value="A New Light"></label>
				<label><span>Subtitle</span><input data-nle-title-subtext value="A MitzvahWorld Film"></label>
				<button type="button" data-nle-custom-title>Generate title</button>
			</section>
			<div class="nle-asset-list" data-nle-asset-list></div>
		`;
		const generators = this.root.querySelector('[data-nle-generators]');
		for (const preset of NLE_ASSET_PRESETS) generators.append(generatorButton(preset));
		this.bind();
	}

	bind() {
		this.root.querySelector('[data-nle-generators]').addEventListener('click', event => {
			const id = event.target.closest('[data-preset-id]')?.dataset.presetId;
			const preset = NLE_ASSET_PRESETS.find(item => item.id === id);
			if (preset) this.addAsset(this.createInstance(preset));
		});
		this.root.querySelector('[data-nle-custom-title]').addEventListener('click', () => {
			const preset = NLE_ASSET_PRESETS.find(item => item.id === 'title');
			const asset = this.createInstance(preset);
			asset.text = this.root.querySelector('[data-nle-title-text]').value.trim() || asset.text;
			asset.subtext = this.root.querySelector('[data-nle-title-subtext]').value.trim();
			asset.label = asset.text;
			this.addAsset(asset);
		});
		this.root.querySelector('.nle-import-media input').addEventListener('change', event => void this.importFiles(event.target));
		this.root.querySelector('[data-nle-asset-list]').addEventListener('click', event => {
			const assetId = event.target.closest('[data-nle-insert-asset]')?.dataset.nleInsertAsset;
			if (assetId) this.insertExisting(assetId);
		});
	}

	createInstance(preset) {
		return createNlePresetInstance(preset, this.generationSequence++);
	}

	addAsset(asset, file = null) {
		if (file) this.repository.add(asset, file);
		this.state.replace(addAssetToProject(this.state.project, asset, this.state.playhead), 'add-asset');
		this.state.select(trackFor(asset.kind), `${asset.id}-clip`);
	}

	insertExisting(assetId) {
		const asset = this.state.project.nle.assets.find(item => item.id === assetId);
		if (!asset) return;
		this.state.replace(addAssetToProject(this.state.project, asset, this.state.playhead), 'insert-asset');
	}

	async importFiles(input) {
		for (const file of input.files || []) {
			const asset = createImportedAsset(file);
			await fillDuration(asset, file);
			this.addAsset(asset, file);
		}
		input.value = '';
	}

	render(snapshot) {
		const list = this.root.querySelector('[data-nle-asset-list]');
		list.replaceChildren(...(snapshot.project.nle?.assets || []).map(asset => createNleAssetCard(asset)));
	}
}

function generatorButton(preset) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.presetId = preset.id;
	button.innerHTML = `<span aria-hidden="true">${preset.icon}</span><strong>${preset.label}</strong><small>Generate</small>`;
	return button;
}

function trackFor(kind) {
	if (kind === 'title') return 'nle-overlay';
	if (kind === 'tone' || kind === 'audio') return 'nle-audio';
	return 'nle-visual';
}

function fillDuration(asset, file) {
	if (!['audio', 'video'].includes(asset.kind)) return Promise.resolve();
	return new Promise(resolve => {
		const media = document.createElement(asset.kind);
		media.preload = 'metadata';
		media.onloadedmetadata = () => {
			asset.duration = Number.isFinite(media.duration) ? media.duration : null;
			URL.revokeObjectURL(media.src);
			resolve();
		};
		media.onerror = () => resolve();
		media.src = URL.createObjectURL(file);
	});
}
