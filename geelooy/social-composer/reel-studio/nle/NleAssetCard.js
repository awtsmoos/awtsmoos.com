// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAssetCard
 * @description
 * Every generated or imported asset receives a safe text-only card, one visible
 * type receipt, and one explicit action to place it at the current playhead.
 */

export function createNleAssetCard(asset, selected = false) {
	const card = document.createElement('article');
	card.className = `nle-asset-card nle-asset-${safeClass(asset.kind)}`;
	card.dataset.assetId = asset.id;
	card.toggleAttribute('aria-current', selected);
	const preview = document.createElement('div');
	preview.className = 'nle-asset-thumbnail';
	preview.textContent = assetIcon(asset.kind);
	if (asset.kind === 'gradient' && asset.colors?.length) {
		preview.style.background = `linear-gradient(${asset.angle || 135}deg, ${asset.colors.join(', ')})`;
	}
	const copy = document.createElement('div');
	copy.className = 'nle-asset-copy';
	const strong = document.createElement('strong');
	strong.textContent = asset.label || asset.id;
	const small = document.createElement('small');
	small.textContent = assetDescription(asset);
	copy.append(strong, small);
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.nleInsertAsset = asset.id;
	button.textContent = '+ Timeline';
	card.append(preview, copy, button);
	return card;
}

function assetDescription(asset) {
	if (asset.kind === 'particles') return `${asset.count} particles · seed ${asset.seed}`;
	if (asset.kind === 'tone') return `${asset.frequency} Hz · ${asset.waveform}`;
	if (asset.kind === 'title') return asset.text || 'Title card';
	if (asset.source === 'session-file') return asset.mimeType || asset.kind;
	return asset.kind;
}

function assetIcon(kind) {
	return ({ audio: '♫', gradient: '◒', image: '▧', particles: '✦', title: 'T', tone: '∿', video: '▶' })[kind] || '◇';
}

function safeClass(value) {
	return String(value || 'asset').replace(/[^a-z0-9-]+/gi, '-');
}
