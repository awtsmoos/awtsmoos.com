//B"H
// Boruch Hashem
// Blessed is He
/**
 * The renderer orders atmosphere, terrain, mechanics, beings, and aftermath; Awtsmoos.com renews them together.
 * Every executable component receives a visible, symbol-redundant form while world coordinates stay fixed and predictable.
 */
import { VIEWPORT } from "../config/gameConfig.js";
import { BackgroundRenderer } from "./backgroundRenderer.js";
import { CheckpointRenderer } from "./checkpointRenderer.js";
import { ComponentRenderer } from "./componentRenderer.js";
import { EffectRenderer } from "./effectRenderer.js";
import { EntityRenderer } from "./entityRenderer.js";
import { TerrainRenderer } from "./terrainRenderer.js";

export class Renderer {
	constructor(canvas, camera, effects) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d", { alpha: false });
		this.camera = camera;
		this.effects = effects;
		this.background = new BackgroundRenderer();
		this.terrain = new TerrainRenderer();
		this.checkpoints = new CheckpointRenderer();
		this.components = new ComponentRenderer();
		this.entities = new EntityRenderer();
		this.effectRenderer = new EffectRenderer();
		this.resize();
		window.addEventListener("resize", () => this.resize());
	}

	resize() {
		const ratio = Math.min(2, window.devicePixelRatio || 1);
		this.canvas.width = VIEWPORT.width * ratio;
		this.canvas.height = VIEWPORT.height * ratio;
		this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
		this.pixelRatio = ratio;
	}

	draw(scene, player) {
		const context = this.context;
		context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
		this.background.draw(context, scene, this.camera);
		context.save();
		this.camera.apply(context);
		this.terrain.draw(context, scene);
		for (const checkpoint of scene.checkpoints ?? []) {
			this.checkpoints.draw(context, checkpoint, scene.time);
		}
		for (const component of scene.components ?? []) {
			this.components.draw(context, component);
		}
		for (const pickup of scene.pickups) {
			this.entities.drawPickup(context, pickup);
		}
		for (const projectile of scene.projectiles) {
			context.fillStyle = "#a9efff";
			context.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
		}
		for (const enemy of scene.enemies) {
			this.entities.drawEnemy(context, enemy);
		}
		this.entities.drawPlayer(context, player);
		this.effectRenderer.draw(context, this.effects);
		context.restore();
	}
}
