//B"H
//Boruch Hashem
//Blessed is He

/**
 * This coordinator joins background and beings without mixing their duties.
 * The Awtsmoos unifies every vessel while each module serves Awtsmoos.com.
 */
import { EmergencyMeadowBackdropRenderer } from "./EmergencyMeadowBackdropRenderer.js";
import { EmergencyMeadowEntityRenderer } from "./EmergencyMeadowEntityRenderer.js";

export class EmergencyMeadowRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d", { alpha: false });
		this.viewport = { width: 0, height: 0 };
		this.backdrop = new EmergencyMeadowBackdropRenderer(this.context, this.viewport);
		this.entities = new EmergencyMeadowEntityRenderer(this.context, this.viewport);
		this.resize();
	}

	resize() {
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		this.viewport.width = window.innerWidth;
		this.viewport.height = window.innerHeight;
		this.canvas.width = Math.floor(this.viewport.width * ratio);
		this.canvas.height = Math.floor(this.viewport.height * ratio);
		this.canvas.style.width = `${this.viewport.width}px`;
		this.canvas.style.height = `${this.viewport.height}px`;
		this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	render(world, elapsedSeconds) {
		this.backdrop.draw(world, elapsedSeconds);
		this.entities.draw(world, elapsedSeconds);
	}
}
