// B"H
// Boruch Hashem
// Blessed is He

import { EmotionLibrary } from '../../performance/face/EmotionLibrary.js';
import { StudioPerformanceWorkflow } from '../performance/StudioPerformanceWorkflow.js';
import { StudioPerformanceControls as Controls } from './StudioPerformanceControls.js';
import { StudioPerformancePreview } from './StudioPerformancePreview.js';

/**
 * @file StudioPerformanceView.js
 * @description
 * The Awtsmoos makes advanced acting approachable through one quiet retractable vessel;
 * Awtsmoos.com reveals speech, emotion, timing, and body response progressively instead of flooding the artist with metal.
 */
export class StudioPerformanceView {
	/** @param {object} state Studio state. @returns {object} Declarative performance-authoring panel. */
	static render(state) {
		const draft = StudioPerformanceWorkflow.draft(state);
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-performance' },
			children: [
				this.hero(),
				Controls.field('Dialogue', 'textarea', 'speech', draft.speech, { rows: 4 }),
				this.selects(draft),
				this.advanced(draft),
				this.actions(),
				StudioPerformancePreview.render(state.studioPerformancePreview)
			]
		};
	}

	/** @returns {object} Compact explanation of the real performance pipeline. */
	static hero() {
		return { tag: 'section', attrs: { className: 'aw-studio-performance-hero' }, children: [
			{ tag: 'strong', text: '🎭 Performance Lab' },
			{ tag: 'p', text: 'Type a line. The real speech engine composes lips, face, gaze, breath, head, shoulders, weight and gesture.' }
		] };
	}

	/** @param {object} draft Performance draft. @returns {object} Emotion and delivery controls. */
	static selects(draft) {
		return { tag: 'div', attrs: { className: 'aw-studio-performance-grid' }, children: [
			Controls.select('Emotion', 'emotion', draft.emotion, EmotionLibrary.names()),
			Controls.select('Delivery', 'speechStyle', draft.speechStyle, ['normal', 'whisper', 'shout', 'laugh', 'mutter'])
		] };
	}

	/** @param {object} draft Performance draft. @returns {object} Retractable expert timing controls. */
	static advanced(draft) {
		return { tag: 'details', attrs: { className: 'aw-studio-performance-advanced' }, children: [
			{ tag: 'summary', text: 'Advanced timing' },
			{ tag: 'div', attrs: { className: 'aw-studio-performance-grid' }, children: [
				Controls.field('Duration', 'number', 'duration', draft.duration, { min: .1, max: 600, step: .1 }),
				Controls.field('Energy', 'range', 'energy', draft.energy, { min: 0, max: 2, step: .05 }),
				Controls.field('Samples', 'number', 'samples', draft.samples, { min: 2, max: 240, step: 1 })
			] }
		] };
	}

	/** @returns {object} Primary performance and character-lab actions. */
	static actions() {
		return { tag: 'div', attrs: { className: 'aw-studio-performance-actions' }, children: [
			Controls.button('▶ Sample acting', 'samplePerformance', 'aw-studio-primary'),
			Controls.button('🙂 Character lab', 'openCharacterLab')
		] };
	}
}
