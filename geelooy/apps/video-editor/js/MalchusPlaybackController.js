// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals the whole edit through the present instant;
 * Awtsmoos.com lets playhead, preview, captions, and cuts emerge from one measured playback source.
 */
export class MalchusPlaybackController {
	constructor({ dom, state, scale, captions, createTimelineItem }) {
		this.dom = dom;
		this.state = state;
		this.scale = scale;
		this.captions = captions;
		this.createTimelineItem = createTimelineItem;
		this.frameRequest = null;
		this.bind();
		this.syncAvailability();
		this.renderFrame(0);
	}

	bind() {
		this.dom.playBtn.addEventListener("click", () => this.play());
		this.dom.pauseBtn.addEventListener("click", () => this.pause());
		this.dom.cutBtn.addEventListener("click", () => this.cut());
		this.dom.audioPlayer.addEventListener("timeupdate", () => {
			this.renderFrame(this.dom.audioPlayer.currentTime);
		});
		this.dom.audioPlayer.addEventListener("ended", () => {
			this.state.isPlaying = false;
			this.stopLoop();
			this.renderFrame(this.dom.audioPlayer.currentTime);
		});
		this.dom.audioPlayer.addEventListener("loadedmetadata", () => this.syncAvailability());
		this.dom.fileInput.addEventListener("change", () => setTimeout(() => this.syncAvailability(), 0));
		this.dom.timeline.addEventListener("click", () => setTimeout(() => this.syncAvailability(), 0));
		this.dom.timeline.addEventListener("keydown", () => setTimeout(() => this.syncAvailability(), 0));
	}

	/** Disables transport actions that have nothing to act on, and says why. */
	syncAvailability() {
		const hasAudio = Boolean(this.dom.audioPlayer.src);
		this.dom.playBtn.disabled = !hasAudio;
		this.dom.playBtn.title = hasAudio ? "Play" : "Import an audio file to play";
		const hasSelection = Boolean(this.state.selectedItem);
		this.dom.cutBtn.disabled = !hasSelection;
		this.dom.cutBtn.title = hasSelection ? "Cut selected clip at playhead" : "Select a clip on the timeline to cut";
	}

	async play() {
		if (!this.dom.audioPlayer.src) {
			return;
		}
		try {
			await this.dom.audioPlayer.play();
			this.state.isPlaying = true;
			this.startLoop();
		} catch (error) {
			console.warn("Awtsmoos Video Editor could not begin playback.", error);
		}
	}

	pause() {
		this.dom.audioPlayer.pause();
		this.state.isPlaying = false;
		this.stopLoop();
		this.renderFrame(this.dom.audioPlayer.currentTime);
	}

	cut() {
		const selected = this.state.selectedItem;
		if (!selected) {
			return;
		}
		const nextConfig = selected.splitAt(this.dom.audioPlayer.currentTime);
		if (!nextConfig) {
			return;
		}
		const nextItem = this.createTimelineItem(nextConfig);
		this.state.select(nextItem);
		this.scale.syncWidth();
		this.syncAvailability();
	}

	startLoop() {
		this.stopLoop();
		const reveal = () => {
			this.renderFrame(this.dom.audioPlayer.currentTime);
			if (this.state.isPlaying) {
				this.frameRequest = requestAnimationFrame(reveal);
			}
		};
		this.frameRequest = requestAnimationFrame(reveal);
	}

	stopLoop() {
		if (this.frameRequest !== null) {
			cancelAnimationFrame(this.frameRequest);
			this.frameRequest = null;
		}
	}

	renderFrame(time) {
		this.dom.playhead.style.left = `${this.scale.timeToPixels(time)}px`;
		this.captions.render(time);
		const imageItem = this.state.timelineItems.find(item => {
			return item.type === "image" && time >= item.start && time <= item.start + item.duration;
		});
		this.renderImage(imageItem, time);
	}

	renderImage(item, time) {
		if (!item) {
			this.dom.previewImage.hidden = true;
			this.dom.previewEmpty.hidden = false;
			return;
		}
		const progress = Math.min(1, Math.max(0, (time - item.start) / item.duration));
		this.dom.previewImage.src = item.url;
		this.dom.previewImage.style.transform = `scale(${1 + 0.2 * progress}) translateX(${15 * progress}px)`;
		this.dom.previewImage.hidden = false;
		this.dom.previewEmpty.hidden = true;
	}
}
