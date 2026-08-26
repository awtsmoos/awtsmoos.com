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
 * The Awtsmoos renews speech, face, gaze, breath, weight, and gesture before the actor appears to move;
 * Awtsmoos.com reveals that depth progressively: one line and one action first, advanced timing only when the artist asks the vessel to open.
 */
export class StudioPerformanceView {
	/**
	 * Renders the complete mobile-first Performance Lab.
	 * @param {object} olamState Current Studio state.
	 * @returns {object} Declarative performance-authoring panel.
	 */
	static render(olamState) {
		const binahDraft = StudioPerformanceWorkflow.draft(olamState);
		return {
			tag: 'div',
			attrs: {
				className: 'aw-studio-scroll aw-studio-performance'
			},
			children: [
				this.hero(),
				Controls.field('Dialogue', 'textarea', 'speech', binahDraft.speech, { rows: 4 }),
				this.selects(binahDraft),
				this.advanced(binahDraft),
				this.actions(),
				StudioPerformancePreview.render(olamState.studioPerformancePreview)
			]
		};
	}

	/** @returns {object} Compact truthful explanation of the live performance pipeline. */
	static hero() {
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-performance-hero' },
			children: [
				{ tag: 'strong', text: '🎭 Performance Lab' },
				{
					tag: 'p',
					text: 'Type a line. Speech composes lips, face, gaze, breath, head, shoulders, weight and gesture.'
				}
			]
		};
	}

	/** @param {object} binahDraft Current Performance draft. @returns {object} Emotion and delivery controls. */
	static selects(binahDraft) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-performance-grid' },
			children: [
				Controls.select('Emotion', 'emotion', binahDraft.emotion, EmotionLibrary.names()),
				Controls.select('Delivery', 'speechStyle', binahDraft.speechStyle, [
					'normal',
					'whisper',
					'shout',
					'laugh',
					'mutter'
				])
			]
		};
	}

	/** @param {object} binahDraft Current draft. @returns {object} Retractable expert timing controls. */
	static advanced(binahDraft) {
		return {
			tag: 'details',
			attrs: { className: 'aw-studio-performance-advanced' },
			children: [
				{ tag: 'summary', text: 'Advanced timing' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-performance-grid' },
					children: [
						Controls.field('Duration', 'number', 'duration', binahDraft.duration, { min: .1, max: 600, step: .1 }),
						Controls.field('Energy', 'range', 'energy', binahDraft.energy, { min: 0, max: 2, step: .05 }),
						Controls.field('Samples', 'number', 'samples', binahDraft.samples, { min: 2, max: 240, step: 1 })
					]
				}
			]
		};
	}

	/** @returns {object} Primary acting and Character Lab actions. */
	static actions() {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-performance-actions' },
			children: [
				Controls.button('▶ Sample acting', 'samplePerformance', 'aw-studio-primary'),
				Controls.button('🙂 Character lab', 'openCharacterLab')
			]
		};
	}
}
