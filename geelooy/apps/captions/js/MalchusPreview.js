// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a hidden rendering become visible in Malchus;
 * Awtsmoos.com keeps preview drawing small and focused so worker logic never leaks into the interface vessel.
 */
export class MalchusPreview {
	constructor(dom) {
		this.dom = dom;
		this.context = dom.previewCanvas.getContext("2d");
	}

	connect() {
		this.drawInitialState();
		return this;
	}

	drawInitialState() {
		const canvas = this.dom.previewCanvas;
		const gradient = this.context.createRadialGradient(
			canvas.width * .5,
			canvas.height * .38,
			80,
			canvas.width * .5,
			canvas.height * .5,
			canvas.height * .7
		);
		gradient.addColorStop(0, "#16273d");
		gradient.addColorStop(.48, "#090d18");
		gradient.addColorStop(1, "#03050a");
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, canvas.width, canvas.height);
		this.context.textAlign = "center";
		this.context.fillStyle = "#84dfff";
		this.context.font = "700 68px system-ui";
		this.context.fillText("EIN SOF", canvas.width / 2, canvas.height / 2 - 16);
		this.context.fillStyle = "rgba(235,247,255,.62)";
		this.context.font = "34px system-ui";
		this.context.fillText("The vision appears here", canvas.width / 2, canvas.height / 2 + 58);
	}

	/** @param {ImageBitmap} bitmap Worker-rendered vision to reveal. */
	drawBitmap(bitmap) {
		this.context.clearRect(
			0,
			0,
			this.dom.previewCanvas.width,
			this.dom.previewCanvas.height
		);
		this.context.drawImage(
			bitmap,
			0,
			0,
			this.dom.previewCanvas.width,
			this.dom.previewCanvas.height
		);
		bitmap.close?.();
	}

	/** @returns {Promise<Blob>} Current preview encoded as a JPEG. */
	toJpeg() {
		return new Promise((resolve, reject) => {
			this.dom.previewCanvas.toBlob(blob => {
				if (blob) resolve(blob);
				else reject(new Error("Could not encode Ein Sof JPEG."));
			}, "image/jpeg", .92);
		});
	}
}
