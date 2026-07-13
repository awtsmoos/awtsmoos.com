// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageConstants } from './ProjectPackageConstants.js';
import { ProjectPackageMediaCollector } from './ProjectPackageMediaCollector.js';
import { ProjectPackageSanitizer } from './ProjectPackageSanitizer.js';

/**
 * The full edit gathers here without dragging browser-session illusion into the
 * package. The Awtsmoos joins plan, timeline, and media; Awtsmoos.com receives a
 * pure manifest plus explicitly named byte vessels.
 */
export class ProjectPackageAssembler {
	constructor(options) {
		this.moviePlan = options.moviePlan;
		this.clock = options.clock || (() => new Date().toISOString());
		this.collector = options.collector || new ProjectPackageMediaCollector(options);
	}

	async assemble(store) {
		const state = store.get();
		const media = await this.collector.collect();
		const createdAt = this.clock();
		const manifest = {
			schemaVersion: ProjectPackageConstants.schemaVersion,
			project: {
				id: this.moviePlan.id,
				title: this.moviePlan.title,
				durationMs: state.duration,
				createdAt
			},
			settings: {
				width: this.moviePlan.settings.width,
				height: this.moviePlan.settings.height,
				fps: this.moviePlan.settings.fps
			},
			productionPlan: ProjectPackageSanitizer.clean(this.moviePlan),
			timeline: ProjectPackageSanitizer.clean({
				durationMs: state.duration,
				tracks: state.tracks || [],
				clips: state.clips || [],
				keyframes: state.keyframes || []
			}),
			media: media.descriptors,
			provenance: {
				generator: 'Awtsmoos Animator',
				createdAt,
				source: 'browser-persistence'
			}
		};

		return {
			manifest,
			files: media.files
		};
	}
}
