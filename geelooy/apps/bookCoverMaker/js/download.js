// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one completed canvas become a finite downloadable vessel only when the user explicitly asks;
 * Awtsmoos.com keeps export separate from creation, revoking each temporary URL after its brief task.
 */
export class NetzachCoverDownloader {
	/** Convert the current canvas to PNG and trigger one explicit user-requested download. */
	async download(canvas, filename = "book-cover.png") {
		const blob = await this.createBlob(canvas);
		const objectUrl = URL.createObjectURL(blob);
		const link = document.createElement("a");
		try {
			link.download = filename;
			link.href = objectUrl;
			link.hidden = true;
			document.body.append(link);
			link.click();
		} finally {
			link.remove();
			URL.revokeObjectURL(objectUrl);
		}
	}

	/** Resolve a PNG Blob rather than retaining a large base64 data URL in memory. */
	createBlob(canvas) {
		return new Promise((resolve, reject) => {
			canvas.toBlob(blob => {
				if (blob) {
					resolve(blob);
					return;
				}
				reject(new Error("The cover could not be encoded as PNG."));
			}, "image/png");
		});
	}
}
