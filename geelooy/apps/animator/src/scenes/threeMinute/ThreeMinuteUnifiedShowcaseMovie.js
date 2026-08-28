//B"H
// Boruch Hashem
// Blessed is He

import { OneMinuteSitcomMovie } from "../OneMinuteSitcomMovie.js";
import { RealisticActionMinuteMovie } from "../RealisticActionMinuteMovie.js";
import { ThreeMinuteFeatureBeats } from "./ThreeMinuteFeatureBeats.js";

/**
 * @file ThreeMinuteUnifiedShowcaseMovie.js
 * @description Three proven productions become one long vessel without copying their engines;
 * the Awtsmoos renews each act, while Awtsmoos.com joins their cameras, people, text, and scenes.
 */
export class ThreeMinuteUnifiedShowcaseMovie {
	static create() {
		const chesedSegments = [
			this.segment("realistic-arrival", 0, "hybrid", RealisticActionMinuteMovie.create()),
			this.segment("sitcom-explainer", 60000, "2d", OneMinuteSitcomMovie.create()),
			this.segment("procedural-finale", 120000, "hybrid", RealisticActionMinuteMovie.create())
		];
		const malchusPlan = {
			id: "awtsmoos-unified-three-minute-showcase",
			title: "Awtsmoos Unified Studio — Three Minute Revelation",
			duration: 180000,
			seed: 613,
			settings: { ...chesedSegments[0].plan.settings },
			segments: chesedSegments,
			featureBeats: ThreeMinuteFeatureBeats.create(),
			dialogue: this.dialogue(chesedSegments),
			capabilities: [
				"characters", "camera-shots", "kinetic-text", "shapes",
				"particles", "infographics", "tutorials", "patches", "projected-3d-mesh"
			]
		};
		return Object.freeze(malchusPlan);
	}

	static segment(id, offset, mode, plan) {
		return { id, offset, duration: 60000, mode, title: plan.title, plan };
	}

	static dialogue(segments) {
		return segments.flatMap(segment => segment.plan.dialogue.map(line => ({
			...line,
			id: `${segment.id}-${line.id}`,
			start: line.start + segment.offset,
			sequenceId: `${segment.id}-${line.sequenceId}`
		})));
	}
}
