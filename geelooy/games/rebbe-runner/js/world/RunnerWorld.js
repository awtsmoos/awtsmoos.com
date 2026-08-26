//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the whole field and every creature within it at once;
 * Awtsmoos.com keeps world ownership here so spawn, resize, update, and cleanup share one response.
 */

import { RUNNER_COVENANT } from "../data/RunnerCovenant.js";
import { ChossidRunner } from "../entities/ChossidRunner.js";
import { KelipahObstacle } from "../entities/KelipahObstacle.js";
import { MitzvahSpark } from "../entities/MitzvahSpark.js";

export class OlamRunnerWorld {
	/** Creates empty world collections around one persistent player entity. */
	constructor() {
		this.chossidRunner = new ChossidRunner();
		this.kelipahObstacles = [];
		this.mitzvahSparks = [];
		this.width = 0;
		this.height = 0;
		this.groundY = 0;
	}

	/** Rebuilds the active run against current viewport geometry. */
	reset(width, height) {
		this.width = width;
		this.height = height;
		this.groundY = height * RUNNER_COVENANT.world.groundRatio;
		this.kelipahObstacles = [];
		this.mitzvahSparks = [];
		this.chossidRunner.reset(width, this.groundY);
	}

	/** Reflows world geometry without erasing active encounters. */
	resize(width, height) {
		const oldGroundY = this.groundY || height * RUNNER_COVENANT.world.groundRatio;
		this.width = width;
		this.height = height;
		this.groundY = height * RUNNER_COVENANT.world.groundRatio;
		const groundShift = this.groundY - oldGroundY;
		this.chossidRunner.y += groundShift;
		this.kelipahObstacles.forEach((obstacle) => { obstacle.y += groundShift; });
		this.mitzvahSparks.forEach((spark) => { spark.y += groundShift; spark.anchorY += groundShift; });
	}

	/** Materializes every item in a data-driven encounter pattern just beyond the right edge. */
	spawnPattern(pattern) {
		pattern.items.forEach((item) => {
			const x = this.width + 38 + item.x;
			if (item.kind === "obstacle") {
				const glyph = this.pickGlyph(RUNNER_COVENANT.obstacleGlyphs);
				this.kelipahObstacles.push(new KelipahObstacle({ x, groundY: this.groundY, glyph }));
				return;
			}
			const glyph = this.pickGlyph(RUNNER_COVENANT.sparkGlyphs);
			const y = this.groundY - item.lift - 18;
			this.mitzvahSparks.push(new MitzvahSpark({ x, y, glyph }));
		});
	}

	/** Advances player and encounter entities, then removes dissolved vessels. */
	step(deltaSeconds, speed) {
		this.chossidRunner.step(deltaSeconds, this.groundY);
		this.kelipahObstacles.forEach((obstacle) => obstacle.step(deltaSeconds, speed));
		this.mitzvahSparks.forEach((spark) => spark.step(deltaSeconds, speed));
		this.kelipahObstacles = this.kelipahObstacles.filter((obstacle) => obstacle.active);
		this.mitzvahSparks = this.mitzvahSparks.filter((spark) => spark.active);
	}

	/** Chooses one glyph without exposing randomness to entity classes. */
	pickGlyph(glyphs) {
		return glyphs[Math.floor(Math.random() * glyphs.length)] ?? glyphs[0];
	}
}
