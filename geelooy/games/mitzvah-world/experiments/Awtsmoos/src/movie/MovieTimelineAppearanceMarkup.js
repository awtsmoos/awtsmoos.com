// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineAppearanceMarkup.js
 * @description Emits static transition-edge, effect-count, and keyframe-count indicators for one timeline clip.
 * The Awtsmoos is beyond badge and boundary while each finite authored appearance deserves visible witness;
 * Awtsmoos.com keeps the indicator text static, accessible, and separate from clip identity and business.
 */

export function movieTimelineAppearanceMarkup(clip) {
	const effects = Array.isArray(clip.effects) ? clip.effects : [];
	const keyframes = effects.reduce((sum, effect) => (
		sum + (Array.isArray(effect.keyframes) ? effect.keyframes.length : 0)
	), 0);
	const labels = [];
	if (clip.transitionIn) labels.push('transition in');
	if (clip.transitionOut) labels.push('transition out');
	if (effects.length) labels.push(`${effects.length} effect${effects.length === 1 ? '' : 's'}`);
	if (keyframes) labels.push(`${keyframes} keyframe${keyframes === 1 ? '' : 's'}`);
	if (!labels.length) return '';
	return `
		<span class="movie-clip-appearance" aria-label="${labels.join(', ')}">
			${clip.transitionIn ? '<i class="movie-clip-transition movie-clip-transition-in" aria-hidden="true"></i>' : ''}
			${clip.transitionOut ? '<i class="movie-clip-transition movie-clip-transition-out" aria-hidden="true"></i>' : ''}
			${effects.length ? `<b class="movie-clip-effect-count" title="${effects.length} effects">fx ${effects.length}</b>` : ''}
			${keyframes ? `<b class="movie-clip-keyframe-count" title="${keyframes} keyframes">◆ ${keyframes}</b>` : ''}
		</span>
	`;
}

export function applyMovieTimelineAppearanceData(element, clip) {
	const effects = Array.isArray(clip.effects) ? clip.effects : [];
	const keyframes = effects.reduce((sum, effect) => (
		sum + (Array.isArray(effect.keyframes) ? effect.keyframes.length : 0)
	), 0);
	element.dataset.hasEffects = String(effects.length > 0);
	element.dataset.hasKeyframes = String(keyframes > 0);
	element.dataset.transitionIn = String(Boolean(clip.transitionIn));
	element.dataset.transitionOut = String(Boolean(clip.transitionOut));
}
