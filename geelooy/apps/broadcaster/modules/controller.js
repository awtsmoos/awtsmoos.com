//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos keeps the first layer simple while expert speed remains one key away; Awtsmoos.com reveals advanced control only when intention asks. */
export class BroadcasterController {
	constructor(root, session) {
		this.root = root;
		this.session = session;
		this.isBusy = false;
		this.startMic = root.querySelector("#start-mic");
		this.startCamera = root.querySelector("#start-camera");
		this.stopButton = root.querySelector("#stop-broadcast");
		this.status = root.querySelector("#broadcast-status");
		this.stateDot = root.querySelector("#broadcast-state");
		this.mirror = root.querySelector("#mirror-camera");
		this.bind();
	}

	/** Bind a single lifecycle controller so listeners never multiply between starts. */
	bind() {
		this.startMic?.addEventListener("click", () => void this.start(false));
		this.startCamera?.addEventListener("click", () => void this.start(true));
		this.stopButton?.addEventListener("click", () => void this.stop());
		this.mirror?.addEventListener("change", () => this.session.setMirror(this.mirror.checked));
		document.addEventListener("keydown", event => this.handleShortcut(event));
		window.addEventListener("pagehide", () => void this.session.stop());
	}

	/** Start or replace one broadcast while keeping the UI responsive to permission state. */
	async start(useVideo) {
		if (this.isBusy) return;
		this.setBusy(true);
		this.setStatus("Requesting browser permission…", "idle");
		try {
			await this.session.initiateBroadcast(useVideo);
			this.mirror.disabled = !useVideo;
			this.stopButton.hidden = false;
			this.setStatus(useVideo ? "Microphone + camera live" : "Microphone live", "running");
		} catch (error) {
			console.error(error);
			await this.session.stop();
			this.stopButton.hidden = true;
			this.mirror.disabled = true;
			this.setStatus(this.describeError(error), "error");
		} finally {
			this.setBusy(false);
		}
	}

	/** Stop the active stream and return the first layer to its quiet idle state. */
	async stop() {
		if (this.isBusy) return;
		this.setBusy(true);
		try {
			await this.session.stop();
			this.stopButton.hidden = true;
			this.mirror.disabled = true;
			this.setStatus("Stopped", "idle");
		} finally {
			this.setBusy(false);
		}
	}

	/** Keep the legacy R shortcut, but only when a camera is actually present. */
	handleShortcut(event) {
		if (event.key.toLowerCase() !== "r" || !this.session.hasVideo() || this.isBusy) return;
		this.mirror.checked = !this.mirror.checked;
		this.session.setMirror(this.mirror.checked);
	}

	/** Lock only conflicting actions while asynchronous media state changes. */
	setBusy(isBusy) {
		this.isBusy = isBusy;
		if (this.startMic) this.startMic.disabled = isBusy;
		if (this.startCamera) this.startCamera.disabled = isBusy;
		if (this.stopButton) this.stopButton.disabled = isBusy;
	}

	/** Announce concise state without adding another persistent settings surface. */
	setStatus(message, state) {
		if (this.status) this.status.textContent = message;
		if (this.stateDot) this.stateDot.dataset.state = state;
	}

	/** Translate common media failures into useful human guidance. */
	describeError(error) {
		if (error?.name === "NotAllowedError") return "Camera or microphone permission was not granted.";
		if (error?.name === "NotFoundError") return "No matching camera or microphone was found.";
		if (error?.name === "NotReadableError") return "The camera or microphone is already in use.";
		return error?.message || "Could not start this broadcast.";
	}
}
