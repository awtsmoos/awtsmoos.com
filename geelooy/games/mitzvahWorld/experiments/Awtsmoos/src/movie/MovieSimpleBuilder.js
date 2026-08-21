// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleBuilder.js
 * @description Gives scripts, AI agents, examples, and humans a tiny fluent language that still produces the native validated Movie Project used by the full Studio.
 * RESPONSIBILITY: coordinate pure simple-world, shape, text, particle, camera, shot, snapshot, and compile operations around one project document.
 * NON-RESPONSIBILITY: this builder does not own rendering, browser state, history, DOM, or a private movie schema.
 * The Awtsmoos is beyond every chain of calls while one thought may unfold world, word, spark, and lens; Awtsmoos.com keeps that surface simple while the deep Movie contract remains whole beneath.
 */

import { addMovieSimpleCameraShot } from './MovieSimpleCamera.js';
import { addMovieSimpleParticles } from './MovieSimpleParticles.js';
import {
	addMovieSimpleShape,
	configureMovieSimpleWorld,
	createMovieSimpleProject
} from './MovieSimpleProject.js';
import { addMovieSimpleText } from './MovieSimpleText.js';
import { compileMovieProjectSnapshot } from './MovieStudioApiProjectTools.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieSimpleBuilder {
	constructor(options = {}) {
		this.document = createMovieSimpleProject(options);
	}

	/** Configures generated atmosphere or binds an existing Mitzvah world reference. */
	world(options = {}) {
		configureMovieSimpleWorld(this.document, options);
		return this;
	}

	/** Adds box, sphere, cylinder, or plane geometry intent to the generated world. */
	shape(type, options = {}) {
		addMovieSimpleShape(this.document, type, options);
		return this;
	}

	/** Adds native and NLE-visible cinematic text. */
	text(value, options = {}) {
		addMovieSimpleText(this.document, value, options);
		return this;
	}

	/** Adds one bounded particle preset through the existing particle graph contract. */
	particles(preset, options = {}) {
		addMovieSimpleParticles(this.document, preset, options);
		return this;
	}

	/** Adds one editable camera shot using the friendly preset vocabulary. */
	camera(preset, options = {}) {
		addMovieSimpleCameraShot(this.document, preset, options);
		return this;
	}

	/** Adds one shot using `{ camera, ...timing }` or `(preset, options)` syntax. */
	shot(source = {}, options = {}) {
		if (typeof source === 'string') {
			return this.camera(source, options);
		}
		const { camera = 'wide', ...shotOptions } = source || {};
		return this.camera(camera, shotOptions);
	}

	/** Returns one immutable native project witness suitable for serialization. */
	project() {
		return createMovieProjectSnapshot(this.document);
	}

	/** Compiles and validates through the canonical Movie Project compiler. */
	compile() {
		return compileMovieProjectSnapshot(this.document);
	}
}

/** Creates one fluent native simple-movie builder. */
export function createMovieSimpleBuilder(options = {}) {
	return new MovieSimpleBuilder(options);
}
