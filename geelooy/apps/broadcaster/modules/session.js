//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos carries one intentional stream at a time; Awtsmoos.com closes every finite track, context, river, and surface when it ends. */
import { initializeAwtsmoosLayeredRiver } from "../AwtsmoosRiver.js";
import { BroadcastStage } from "./stage.js";

export class BroadcastSession {
	constructor(stageElement = document.querySelector("#broadcast-stage"), dependencies = {}) {
		this.stage = new BroadcastStage(stageElement);
		this.mediaDevices = dependencies.mediaDevices ?? navigator.mediaDevices;
		this.AudioContextClass = dependencies.AudioContextClass ?? globalThis.AudioContext ?? globalThis.webkitAudioContext;
		this.initializeRiver = dependencies.initializeRiver ?? initializeAwtsmoosLayeredRiver;
		this.stream = null;
		this.videoElement = null;
		this.canvasElement = null;
		this.audioContext = null;
		this.analyser = null;
		this.river = null;
		this.isReversed = false;
	}

	/** Preserve the legacy start signature while guaranteeing at most one active session. */
	async initiateBroadcast(useVideo, canvasWidth = 400, canvasHeight = 200) {
		await this.stop();
		this.stream = await this.mediaDevices.getUserMedia({ video: Boolean(useVideo), audio: true });
		if (useVideo) this.videoElement = this.stage.createVideo(this.stream);
		this.canvasElement = this.stage.createCanvas(canvasWidth, canvasHeight);
		this.setupAudioAnalysis();
		this.animateWavelength();
		this.setMirror(this.isReversed);
	}

	/** Preserve the old audio setup law while making its context explicitly owned. */
	setupAudioAnalysis() {
		if (!this.AudioContextClass) throw new Error("Web Audio is unavailable in this browser.");
		this.audioContext = new this.AudioContextClass();
		this.analyser = this.audioContext.createAnalyser();
		const source = this.audioContext.createMediaStreamSource(this.stream);
		source.connect(this.analyser);
		this.analyser.fftSize = 256;
	}

	/** Preserve the old visualization method while retaining its stoppable engine handle. */
	animateWavelength() {
		this.river = this.initializeRiver(this.canvasElement, this.analyser);
		return this.river;
	}

	/** Mirror the camera preview and retain the expert state for camera-mode switches. */
	setMirror(isMirrored) {
		this.isReversed = Boolean(isMirrored);
		this.stage.setMirror(this.isReversed);
	}

	/** Report whether this session currently owns a visible camera surface. */
	hasVideo() {
		return Boolean(this.videoElement);
	}

	/** Close every finite media resource and stop the animation loop. */
	async stop() {
		this.river?.stop?.();
		this.river = null;
		this.stream?.getTracks?.().forEach(track => track.stop());
		this.stream = null;
		if (this.audioContext && this.audioContext.state !== "closed") await this.audioContext.close();
		this.audioContext = null;
		this.analyser = null;
		this.stage.clear();
		this.videoElement = null;
		this.canvasElement = null;
	}
}
