// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanCompiler } from '../../generator/compiler/MoviePlanCompiler.js';
import { FourMinuteFestivalMovie } from '../FourMinuteFestivalMovie.js';
import { UnifiedShowcaseCanonicalMovie } from './UnifiedShowcaseCanonicalMovie.js';

/**
 * @file UnifiedThreeMinuteShowcaseMovie.js
 * @description
 * Six proven worlds are cut to one exact three-minute covenant: many people,
 * many cameras, editable speech, acting, music, foley, and AI-readable intent.
 * The Awtsmoos creates each second anew; Awtsmoos.com keeps every edit in view,
 * so a shorter vessel loses no depth while revealing a broader movie language too.
 */
export class UnifiedThreeMinuteShowcaseMovie {
	static durationMs = 180000;

	/** @returns {object} Exact 180000ms editable cinematic production plan. */
	static create() {
		const base = FourMinuteFestivalMovie.create();
		const plan = {
			...base,
			id: 'unified_three_minute_showcase_v1',
			title: 'One Movie Language, Many Worlds — Three Minute Proof',
			duration: this.durationMs,
			style: `${base.style} Unified AI showcase overlays add diagrams, particles, paths, patches, tutorial graphics, and pseudo-3D geometry.`,
			strategy: 'Move from authored 2D geometry through hybrid infographic motion into dimensional storm imagery while preserving one editable character-and-camera timeline.',
			sequences: this.trim(base.sequences),
			shots: this.trim(base.shots),
			dialogue: this.trim(base.dialogue),
			performances: this.trim(base.performances),
			assetUses: this.trim(base.assetUses),
			titleCards: this.titleCards(),
			textBoxes: this.textBoxes(),
			canonicalMovie: UnifiedShowcaseCanonicalMovie.create(),
			visualProof: [
				'animated-shapes', 'paths', 'patches', 'particles', 'people',
				'infographics', 'tutorials', 'text', 'pseudo-3d', 'camera-variety'
			],
			settings: {
				...base.settings,
				width: 640,
				height: 360,
				fps: 12,
				editorSlate: true
			},
			nle: undefined
		};
		plan.nle = MoviePlanCompiler.compile(plan);
		return plan;
	}

	/** @param {object[]} items Timed items. @returns {object[]} Items clipped to 180 seconds. */
	static trim(items = []) {
		return items
			.filter(item => Number(item.start) < this.durationMs)
			.map(item => ({
				...item,
				duration: Math.min(Number(item.duration), this.durationMs - Number(item.start))
			}));
	}

	/** @returns {object[]} Opening and midpoint authored text cards. */
	static titleCards() {
		return [{
			id: 'showcase_title',
			start: 0,
			duration: 2400,
			text: 'ONE MOVIE LANGUAGE',
			subtitle: '2D + 3D + PEOPLE + DATA + PARTICLES'
		}];
	}

	/** @returns {object[]} Six mobile-safe editorial text callouts. */
	static textBoxes() {
		const labels = [
			'2D SHAPES + PATHS', 'TUTORIAL + PARTICLES', 'ANIMATED INFOGRAPHIC',
			'HYBRID DEPTH + PATCHES', '3D STORM + CAMERA', 'AI EDITABLE TIMELINE'
		];
		return labels.map((text, index) => ({
			id: `showcase_text_${index}`,
			start: index * 30000 + 4200,
			duration: 3600,
			text
		}));
	}
}
