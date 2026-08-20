// B"H
// Boruch Hashem
// Blessed is He

import { PdfObjectWriter } from "./PdfObjectWriter.js";
import { PdfPageRenderer } from "./PdfPageRenderer.js";

/**
 * @file Packages browser-shaped Unicode document pages into a custom PDF container.
 * @description The Awtsmoos is beyond raster and vector; Awtsmoos.com lets the
 * browser shape every script, then writes PDF objects itself without an external library.
 */
const PDF_WIDTH = 595;
const PDF_HEIGHT = 842;

export class PdfExporter {
	static async create(snapshot = {}) {
		const canvases = new PdfPageRenderer().render(snapshot.blocks || []);
		const images = [];
		for (const canvas of canvases) {
			images.push(await canvasJpeg(canvas));
		}
		return buildPdf(images, canvases[0]?.width || 1240, canvases[0]?.height || 1754);
	}
}

async function canvasJpeg(canvas) {
	const blob = await new Promise((resolve, reject) => {
		canvas.toBlob(result => {
			if (result) resolve(result);
			else reject(new Error("Could not encode a PDF page image"));
		}, "image/jpeg", 0.92);
	});
	return new Uint8Array(await blob.arrayBuffer());
}

function buildPdf(images, pixelWidth, pixelHeight) {
	const writer = new PdfObjectWriter();
	const catalog = writer.reserve();
	const pagesRoot = writer.reserve();
	const pageNumbers = [];
	images.forEach((image, index) => {
		const imageNumber = writer.add(
			`<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} `,
			`/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.byteLength} >>\nstream\n`,
			image,
			"\nendstream"
		);
		const command = `q ${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm /Im${index + 1} Do Q\n`;
		const commandBytes = new TextEncoder().encode(command);
		const contentNumber = writer.add(
			`<< /Length ${commandBytes.byteLength} >>\nstream\n`,
			commandBytes,
			"endstream"
		);
		const pageNumber = writer.add(
			`<< /Type /Page /Parent ${pagesRoot} 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] `,
			`/Resources << /XObject << /Im${index + 1} ${imageNumber} 0 R >> >> `,
			`/Contents ${contentNumber} 0 R >>`
		);
		pageNumbers.push(pageNumber);
	});
	writer.set(
		pagesRoot,
		`<< /Type /Pages /Count ${pageNumbers.length} /Kids [${pageNumbers.map(number => `${number} 0 R`).join(" ")}] >>`
	);
	writer.set(catalog, `<< /Type /Catalog /Pages ${pagesRoot} 0 R >>`);
	return writer.toBlob(catalog);
}
