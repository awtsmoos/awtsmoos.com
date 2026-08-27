// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers image, audio, and alignment sparks into useful vessels;
 * Awtsmoos.com turns imported files into clear media choices without mixing timeline law into the doorway.
 */
export class NetzachMediaImporter {
	constructor({ dom, state, scale, createTimelineItem }) {
		this.dom = dom;
		this.state = state;
		this.scale = scale;
		this.createTimelineItem = createTimelineItem;
		this.bind();
	}

	bind() {
		this.dom.fileInput.addEventListener("change", event => {
			this.importFiles([...event.target.files]);
			event.target.value = "";
		});
		this.dom.audioPlayer.addEventListener("loadedmetadata", () => {
			this.scale.setDuration(this.dom.audioPlayer.duration);
		});
	}

	async importFiles(files) {
		for (const file of files) {
			if (file.name.toLowerCase().endsWith(".awtsmoos.json")) {
				await this.importAlignment(file);
			} else if (file.type.startsWith("image/")) {
				this.importImage(file);
			} else if (file.type.startsWith("audio/")) {
				this.importAudio(file);
			}
		}
		this.dom.emptyMediaState.hidden = this.dom.binItems.children.length > 1;
	}

	importImage(file) {
		const url = URL.createObjectURL(file);
		const button = document.createElement("button");
		const image = document.createElement("img");
		button.type = "button";
		button.className = "media-item";
		button.setAttribute("aria-label", `Add ${file.name} to timeline`);
		image.src = url;
		image.alt = file.name;
		button.append(image);
		button.addEventListener("click", () => {
			this.createTimelineItem({ url, type: "image", start: 0, duration: 5 });
			this.scale.syncWidth();
		});
		this.dom.binItems.append(button);
	}

	importAudio(file) {
		const url = URL.createObjectURL(file);
		const item = document.createElement("div");
		item.className = "media-item";
		item.setAttribute("role", "listitem");
		item.textContent = `♫ ${file.name}`;
		this.dom.binItems.append(item);
		if (!this.dom.audioPlayer.src) {
			this.dom.audioPlayer.src = url;
		}
	}

	async importAlignment(file) {
		try {
			const text = await file.text();
			const parsed = JSON.parse(text);
			const fragments = Array.isArray(parsed) ? parsed : parsed.fragments;
			if (!Array.isArray(fragments)) {
				throw new Error("Alignment JSON needs a fragments array.");
			}
			this.state.fragments = fragments;
			this.dom.captionFile.hidden = false;
			this.dom.captionFile.textContent = JSON.stringify(fragments, null, 2);
		} catch (error) {
			this.dom.captionFile.hidden = false;
			this.dom.captionFile.textContent = `Could not read alignment file: ${error.message}`;
		}
	}
}
