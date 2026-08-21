//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos joins sound and sight inside one bounded stage; Awtsmoos.com makes each medium responsive, draggable, and calm. */
import { StageDragController } from "./drag.js";

export class BroadcastStage {
	constructor(element) {
		this.element = element ?? document.body;
		this.videoElement = null;
		this.canvasElement = null;
		this.dragControllers = [];
	}

	/** Reveal a muted local camera preview without feeding microphone audio back to speakers. */
	createVideo(stream) {
		const video = document.createElement("video");
		video.className = "broadcast-media broadcast-video";
		video.srcObject = stream;
		video.autoplay = true;
		video.muted = true;
		video.playsInline = true;
		video.setAttribute("aria-label", "Camera preview");
		this.element.appendChild(video);
		this.videoElement = video;
		this.bindDrag(video);
		this.syncState();
		return video;
	}

	/** Create the same intrinsic audio canvas while letting CSS scale its visible vessel. */
	createCanvas(width = 400, height = 200) {
		const canvas = document.createElement("canvas");
		canvas.className = "broadcast-media broadcast-visualizer";
		canvas.width = width;
		canvas.height = height;
		canvas.setAttribute("aria-label", "Sound-reactive Hebrew letter visualization");
		this.element.appendChild(canvas);
		this.canvasElement = canvas;
		this.bindDrag(canvas);
		this.syncState();
		return canvas;
	}

	/** Mirror only the local video preview while leaving drag translation independent. */
	setMirror(isMirrored) {
		this.videoElement?.classList.toggle("is-mirrored", Boolean(isMirrored));
	}

	/** Remove every finite media surface and return the stage to its idle state. */
	clear() {
		this.videoElement?.remove();
		this.canvasElement?.remove();
		this.videoElement = null;
		this.canvasElement = null;
		this.dragControllers = [];
		this.syncState();
	}

	/** Bind one unified pointer drag controller to a created media surface. */
	bindDrag(element) {
		this.dragControllers.push(new StageDragController(this.element, element));
	}

	/** Keep the empty-stage guidance aligned with real media presence. */
	syncState() {
		this.element.classList?.toggle("has-media", Boolean(this.videoElement || this.canvasElement));
	}
}
