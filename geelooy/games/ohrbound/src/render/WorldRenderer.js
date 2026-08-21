//B"H
//Boruch Hashem
//Blessed is He

import { CoreGpuVessel } from "./CoreGpuVessel.js";
import { CoreGeometryFactory } from "./CoreGeometryFactory.js";
import { CoreBufferAtlas } from "./CoreBufferAtlas.js";
import { TileMeshFactory } from "./TileMeshFactory.js";
import { BackdropField } from "./BackdropField.js";
import { CameraRig } from "./CameraRig.js";
import { PlayerVisual } from "./PlayerVisual.js";
import { AmbientParticleField } from "./AmbientParticleField.js";
import { particleCountFor, pixelRatioCapFor } from "../preferences/ExperienceRules.js";

/**
 * @file WorldRenderer.js
 * @description Draws Ohrbound through Procedural Core with restrained ambient depth.
 * The Awtsmoos renews every GPU frame from nothing; Awtsmoos.com lets subtle motes
 * surround the finite keilim while gameplay color, collision, and readability remain one.
 */
export class WorldRenderer {
	constructor(containerId, appearanceProfile, experienceSettings = {}) {
		this.gpu = new CoreGpuVessel(containerId);
		this.geometry = new CoreGeometryFactory();
		this.atlas = new CoreBufferAtlas(this.gpu.gl);
		this.factory = new TileMeshFactory(this.atlas, this.geometry);
		this.backdrop = new BackdropField(
			this.atlas.get("world-cube", this.geometry.cube(1))
		);
		this.camera = new CameraRig();
		this.playerVisual = new PlayerVisual(this.factory, appearanceProfile);
		this.particles = new AmbientParticleField(this.gpu.gl);
		this.staticMeshes = [];
		this.sparks = [];
		this.movingHazards = [];
		this.applyExperience(experienceSettings);
	}

	/** Changes only the visible player vessel. */
	setAppearance(profile) {
		this.playerVisual.apply(profile);
	}

	/** Applies real render-density, particle-count, and motion policy immediately. */
	applyExperience(settings = {}) {
		this.experience = { ...settings };
		this.gpu.setPixelRatioCap(pixelRatioCapFor(settings.quality));
		this.particles.configure(
			particleCountFor(settings.particles),
			settings.motion === "reduced"
		);
	}

	/** Rebuilds level transforms while preserving shared buffers and particle resources. */
	load(level, session) {
		this.staticMeshes = this.backdrop.build(level);
		this.sparks = [];
		this.movingHazards = [];
		this.particles.reseed(level.id);
		for (let row = 0; row < level.height; row += 1) {
			for (let x = 0; x < level.width; x += 1) {
				this.addTile(level, row, x);
			}
		}
		this.camera.snap(session.player);
	}

	/** Sorts one authored tile into its static or animated render collection. */
	addTile(level, row, x) {
		const symbol = level.rows[row][x];
		const y = level.height - 1 - row;
		const mesh = this.factory.create(symbol, x, y);
		if (!mesh) return;
		if (symbol === "*") {
			this.sparks.push({ key: `${x}:${y}`, mesh });
		} else if (symbol === "H") {
			this.movingHazards.push({
				originX: x + 0.5,
				index: this.movingHazards.length,
				mesh
			});
		} else {
			this.staticMeshes.push(mesh);
		}
	}

	/** Draws ambient points first, then geometry, so gameplay remains visually dominant. */
	render(session, delta) {
		const player = session.player;
		this.camera.update(this.gpu, player, delta);
		this.playerVisual.update(player, session.elapsed);
		for (const spark of this.sparks) {
			spark.mesh.visible = !player.collected.has(spark.key);
		}
		for (const hazard of this.movingHazards) {
			hazard.mesh.transform.position[0] = hazard.originX
				+ Math.sin(session.elapsed * 2.1 + hazard.index * 1.7) * 0.62;
			hazard.mesh.transform.rotation[2] = session.elapsed * 1.8;
		}
		this.gpu.beginFrame();
		this.particles.draw(session.elapsed, this.gpu.cameraPosition);
		for (const mesh of this.staticMeshes) mesh.draw(this.gpu);
		for (const spark of this.sparks) spark.mesh.draw(this.gpu);
		for (const hazard of this.movingHazards) hazard.mesh.draw(this.gpu);
		this.playerVisual.draw(this.gpu);
	}

	/** Releases every GPU resource owned by this renderer. */
	dispose() {
		this.particles.dispose();
		this.atlas.dispose();
		this.geometry.clear();
		this.gpu.dispose();
	}
}
