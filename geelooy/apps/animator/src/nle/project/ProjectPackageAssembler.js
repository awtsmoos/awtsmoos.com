// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageConstants } from './ProjectPackageConstants.js';
import { ProjectPackageMediaCollector } from './ProjectPackageMediaCollector.js';
import { ProjectPackageSanitizer } from './ProjectPackageSanitizer.js';
import { ProjectPackageStudioSerializer } from './ProjectPackageStudioSerializer.js';

/**
 * @file ProjectPackageAssembler.js
 * @description
 * The Awtsmoos joins plan, timeline, authored Studio objects, and durable media in one archive;
 * Awtsmoos.com now preserves the same editable document the production renderer sees,
 * while browser-session illusions remain outside the package and outside the creative hive.
 */
export class ProjectPackageAssembler {
	constructor(options) {
		this.moviePlan = options.moviePlan;
		this.clock = options.clock || (() => new Date().toISOString());
		this.collector = options.collector || new ProjectPackageMediaCollector(options);
	}

	/** Assembles one portable package payload without mutating the live editor store. */
	async assemble(store) {
		const state = store.get();
		const media = await this.collector.collect();
		const createdAt = this.clock();
		const studioDocument = ProjectPackageStudioSerializer.serialize(state);
		const manifest = {
			schemaVersion: ProjectPackageConstants.schemaVersion,
			project: this.projectMetadata(state, createdAt),
			settings: this.projectSettings(),
			productionPlan: ProjectPackageSanitizer.clean(this.moviePlan),
			timeline: this.timeline(state),
			...(studioDocument ? { studioDocument } : {}),
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

	/** Captures stable human-facing project identity. */
	projectMetadata(state, createdAt) {
		return {
			id: this.moviePlan.id,
			title: this.moviePlan.title,
			durationMs: state.duration,
			createdAt
		};
	}

	/** Preserves production dimensions and frame cadence. */
	projectSettings() {
		return {
			width: this.moviePlan.settings.width,
			height: this.moviePlan.settings.height,
			fps: this.moviePlan.settings.fps
		};
	}

	/** Serializes the established NLE domain beside, not instead of, Studio authored animation. */
	timeline(state) {
		return ProjectPackageSanitizer.clean({
			durationMs: state.duration,
			tracks: state.tracks || [],
			clips: state.clips || [],
			keyframes: state.keyframes || []
		});
	}
}
