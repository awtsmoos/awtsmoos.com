//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorMovieAdapter.js
 * @description The Awtsmoos keeps Animator's old doorway alive while one shared movie covenant becomes the root;
 * Awtsmoos.com preserves every legacy alias and adds canonical projection fields so five distinct studios share truth.
 */
import { movieCapabilities } from "../../../shared/movie/index.js";
import { AnimatorMovieAdapter as CanonicalAnimatorMovieAdapter } from "../sharedMovie/AnimatorMovieAdapter.js";

export class AnimatorMovieAdapter {
	constructor(orAgentApi = globalThis.AwtsmoosAnimator) {
		this.agentApi = orAgentApi;
	}

	/** Return Animator's canonical capability profile. */
	capabilities() {
		return movieCapabilities("animator");
	}

	/** Compile through the authoritative shared adapter while preserving historical Animator result names. */
	compile(orMovie) {
		const keterResult = CanonicalAnimatorMovieAdapter.project(orMovie);
		const canonicalMovie = structuredClone(keterResult.canonicalMovie);
		const shots = structuredClone(keterResult.plan?.shots || []);
		const plan = structuredClone(keterResult.plan || {});
		const report = structuredClone(keterResult.report || {});
		const capabilities = structuredClone(keterResult.capabilities || {});
		const projection = { shots: structuredClone(shots), plan: structuredClone(plan) };
		return {
			appId: "animator",
			projection,
			canonicalMovie,
			adapter: "animator-awtsmoos-movie-v1",
			movie: structuredClone(canonicalMovie),
			shots,
			plan,
			report,
			capabilities
		};
	}

	/** Inspect optional runtime-native Animator capabilities without coupling canonical movie truth to runtime availability. */
	async inspectNativeCapabilities() {
		return typeof this.agentApi?.capabilities === "function"
			? this.agentApi.capabilities()
			: null;
	}
}
