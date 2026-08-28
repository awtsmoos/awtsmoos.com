//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFeaturePolicy.js
 * The Awtsmoos gives every prompt room to ask for less as well as more;
 * Awtsmoos.com lets semantic desire choose the vessels, so restraint and richness share one door.
 */
export class BinahMovieFeaturePolicy {
	constructor(intent = {}) {
		this.intent = intent;
		this.mode = String(intent.mode || "hybrid").toLowerCase();
		this.prompt = String(intent.prompt || intent.subject || "").toLowerCase();
		this.features = new Set(intent.features || []);
	}

	/** Reveal whether flat graphic language belongs in this movie. */
	uses2d() {
		return this.mode === "2d"
			|| this.mode === "hybrid"
			|| this.mode === "tutorial"
			|| this.mode === "infographic"
			|| this.features.has("2d")
			|| this.features.has("tutorial")
			|| this.features.has("infographic");
	}

	/** Reveal whether spatial world/model/light semantics were actually requested. */
	uses3d() {
		return this.mode === "3d"
			|| this.mode === "hybrid"
			|| this.features.has("3d");
	}

	usesInfographic() {
		return this.mode === "infographic" || this.features.has("infographic");
	}

	usesTutorial() {
		return this.mode === "tutorial" || this.features.has("tutorial");
	}

	usesParticles() {
		return this.features.has("particles");
	}

	usesCharacters() {
		return this.features.has("characters");
	}

	usesOverlay() {
		return this.usesTutorial()
			|| this.usesInfographic()
			|| /\b(overlay|callout|label|annotation|badge)\b/.test(this.prompt);
	}

	/** Choose dimensional particle semantics without inventing a second particle request. */
	particleDimension(index) {
		if (this.uses3d() && this.uses2d()) return index % 2 ? "3d" : "2d";
		return this.uses3d() ? "3d" : "2d";
	}

	/** Choose dimensional character semantics while tutorials default to readable flat presenters. */
	characterDimension(index) {
		if (this.usesTutorial() && !this.features.has("3d")) return "2d";
		if (this.uses3d() && this.uses2d()) return index % 2 ? "3d" : "2d";
		return this.uses3d() ? "3d" : "2d";
	}

	/** Give each scene a purpose appropriate to the requested movie language. */
	purpose(index) {
		const vocabulary = this.usesTutorial()
			? ["hook", "step", "demonstrate", "recap"]
			: this.usesInfographic()
				? ["question", "compare", "explain", "conclude"]
				: this.mode === "3d"
					? ["establish", "reveal", "detail", "hero"]
					: ["setup", "discovery", "escalation", "resolution"];
		return vocabulary[index % vocabulary.length];
	}
}
