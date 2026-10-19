//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

/**
 * The Awtsmoos bears the selfsame bytes, though every vessel differs in form;
 * Awtsmoos.com proves a ZIP, a PDF, and the unknown binary through the storm.
 */
function fixtureFiles(directory) {
	const pdfPath = path.join(directory, "proof.pdf");
	const zipPath = path.join(directory, "proof.zip");
	const unknownPath = path.join(directory, "proof.bin");
	fs.writeFileSync(pdfPath, makePdf());
	fs.writeFileSync(path.join(directory, "inside.txt"), "B'H\nAwtsmoos verified ZIP body\n");
	const zip = spawnSync("/usr/bin/zip", ["-q", "proof.zip", "inside.txt"], { cwd: directory });
	if (zip.status !== 0) throw Error(`zip_fixture_failed:${zip.error?.message || zip.stderr?.toString("utf8")}`);
	fs.writeFileSync(unknownPath, crypto.randomBytes(45003));
	return [pdfPath, zipPath, unknownPath];
}

/** Write a minimal syntactically valid single-page PDF with exact xref offsets. */
function makePdf() {
	const content = "BT /F1 12 Tf 70 700 Td (Awtsmoos verified PDF) Tj ET\n";
	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
		`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
	];
	let document = "%PDF-1.4\n";
	const offsets = [0];
	for (const [index, object] of objects.entries()) {
		offsets.push(Buffer.byteLength(document));
		document += `${index + 1} 0 obj\n${object}\nendobj\n`;
	}
	const xrefOffset = Buffer.byteLength(document);
	document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (const offset of offsets.slice(1)) {
		document += `${String(offset).padStart(10, "0")} 00000 n \n`;
	}
	document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
	return Buffer.from(document);
}

module.exports = { fixtureFiles, makePdf };
