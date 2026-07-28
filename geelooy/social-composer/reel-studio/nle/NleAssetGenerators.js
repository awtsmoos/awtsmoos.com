// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAssetGenerators
 * @description
 * Deterministic browser recipes become gradients, particles, titles, and tones.
 * The Awtsmoos gives endless variation while Awtsmoos.com records every seed.
 */

export function createGradientAsset(options = {}) {
	return asset('gradient', options, {
		angle: Number(options.angle ?? 135),
		colors: colors(options.colors, ['#120a2a', '#d47cff']),
		label: options.label || 'Cinematic gradient'
	});
}

export function createParticlesAsset(options = {}) {
	return asset('particles', options, {
		colors: colors(options.colors, ['#f7d57a', '#9f5cff']),
		count: bounded(options.count, 20, 420, 120),
		label: options.label || 'Living particles',
		mode: options.mode || 'embers',
		seed: Number(options.seed ?? 613),
		size: bounded(options.size, 1, 18, 5),
		speed: bounded(options.speed, 0.05, 4, 0.8)
	});
}

export function createTitleAsset(options = {}) {
	return asset('title', options, {
		align: options.align || 'center',
		animation: options.animation || 'rise',
		background: options.background || 'rgba(3, 7, 14, .46)',
		color: options.color || '#ffffff',
		fontSize: bounded(options.fontSize, 24, 160, 72),
		label: options.label || 'Title card',
		subtext: String(options.subtext || ''),
		text: String(options.text || 'A new world begins')
	});
}

export function createToneAsset(options = {}) {
	return asset('tone', options, {
		fadeIn: bounded(options.fadeIn, 0, 4, 0.2),
		fadeOut: bounded(options.fadeOut, 0, 4, 0.4),
		frequency: bounded(options.frequency, 30, 2400, 220),
		label: options.label || 'Generated tone',
		volume: bounded(options.volume, 0, 1, 0.08),
		waveform: options.waveform || 'sine'
	});
}

export function createImportedAsset(file) {
	const kind = String(file.type || '').split('/')[0] || 'file';
	return asset(kind, { label: file.name }, {
		label: file.name,
		mimeType: file.type || 'application/octet-stream',
		size: file.size,
		source: 'session-file'
	});
}

export function generatedAssetId(kind, label, seed = Date.now()) {
	const slug = String(label || kind).toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 32) || kind;
	return `${kind}-${slug}-${hash(`${seed}:${label}`)}`;
}

function asset(kind, options, fields) {
	return {
		...fields,
		id: options.id || generatedAssetId(kind, fields.label, options.seed),
		kind
	};
}

function colors(value, fallback) {
	return Array.isArray(value) && value.length >= 2 ? value.slice(0, 4) : fallback;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : fallback));
}

function hash(value) {
	let result = 2166136261;
	for (const character of value) {
		result ^= character.charCodeAt(0);
		result = Math.imul(result, 16777619);
	}
	return (result >>> 0).toString(36);
}
