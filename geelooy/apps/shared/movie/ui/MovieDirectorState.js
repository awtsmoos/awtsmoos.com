//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDirectorState.js
 * @description The Awtsmoos renews the movie while one observable vessel keeps human and AI edits aligned;
 * Awtsmoos.com lets prompt, revision, undo, preview, and handoff share one canonical state by design.
 */
import { TiferesMovieDirector } from "../ai/MovieDirector.js";
import { TiferesMovieRevisionService } from "../ai/MovieRevisionService.js";
import { binahMigrateMovie } from "../protocol/MovieMigration.js";
import { gevurahAssertValidMovie } from "../schema/MovieValidator.js";

export class MalchusMovieDirectorState {
	constructor(orOptions = {}) {
		this.director = new TiferesMovieDirector(orOptions.provider || null);
		this.provider = orOptions.provider || null;
		this.projector = orOptions.projector || null;
		this.movie = null;
		this.revision = null;
		this.listeners = new Set();
	}

	/** Subscribe one UI vessel and immediately reveal the current state. */
	subscribe(orListener) {
		this.listeners.add(orListener);
		orListener(this.snapshot());
		return () => this.listeners.delete(orListener);
	}

	/** Generate a fresh canonical movie from text or structured directing intent. */
	async generate(orBrief) {
		return this.setMovie(await this.director.direct(orBrief), "generated");
	}

	/** Import, migrate, and validate an existing canonical movie. */
	import(orMovie) {
		return this.setMovie(gevurahAssertValidMovie(binahMigrateMovie(orMovie)), "imported");
	}

	/** Ask a provider for surgical patches or apply explicit patches. */
	async revise(orRequest, orPatches = null) {
		this.ensureRevision();
		this.movie = await this.revision.revise(orRequest, orPatches);
		return this.publish("revised");
	}

	/** Undo the latest human or AI canonical revision. */
	undo() {
		this.ensureRevision();
		this.movie = this.revision.undo();
		return this.publish("undo");
	}

	/** Redo the latest undone canonical revision. */
	redo() {
		this.ensureRevision();
		this.movie = this.revision.redo();
		return this.publish("redo");
	}

	/** Return the current native app projection while preserving canonical state. */
	project() {
		if (!this.movie || typeof this.projector !== "function") return null;
		return this.projector(structuredClone(this.movie));
	}

	snapshot() {
		return {
			movie: this.movie ? structuredClone(this.movie) : null,
			projection: this.project(),
			canUndo: Boolean(this.revision?.past?.length),
			canRedo: Boolean(this.revision?.future?.length)
		};
	}

	setMovie(orMovie, orReason) {
		this.movie = gevurahAssertValidMovie(binahMigrateMovie(orMovie));
		this.revision = new TiferesMovieRevisionService(this.movie, this.provider);
		return this.publish(orReason);
	}

	ensureRevision() {
		if (!this.movie || !this.revision) throw new Error("Create or import a movie before revising it.");
	}

	publish(orReason) {
		const keterSnapshot = { ...this.snapshot(), reason: orReason };
		this.listeners.forEach(orListener => orListener(keterSnapshot));
		return structuredClone(this.movie);
	}
}
