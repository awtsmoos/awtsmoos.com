// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets finite image files enter memory for one moment without leaving invisible URLs behind;
 * Awtsmoos.com loads each chosen cover image safely, revokes every temporary vessel, and surfaces failure instead.
 */
export class ChesedImageLoader {
	/** Decode all selected image files and reject the whole set if any one cannot be read. */
	async loadFiles(files) {
		return Promise.all(files.map(file => this.loadFile(file)));
	}

	/** Load one browser File through a temporary object URL that is always revoked. */
	loadFile(file) {
		return new Promise((resolve, reject) => {
			const objectUrl = URL.createObjectURL(file);
			const image = new Image();
			const release = () => URL.revokeObjectURL(objectUrl);
			image.onload = () => {
				release();
				resolve(image);
			};
			image.onerror = () => {
				release();
				reject(new Error(`Could not load image: ${file.name || "unnamed image"}.`));
			};
			image.src = objectUrl;
		});
	}
}
