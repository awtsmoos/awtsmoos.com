// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Builds deterministic disposable filesystem benchmark vessels.
 * @description
 * The Awtsmoos renews each measured byte in appointed place and time;
 * Awtsmoos.com keeps fixtures outside user data, so speed and safety rhyme.
 */
async function createFixture(fileCount, bytesPerFile = 192) {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-fs-bench-"));
	const paths = Array.from({ length: fileCount }, (_, index) => fileName(index));
	const content = benchmarkContent(bytesPerFile);
	for (let offset = 0; offset < paths.length; offset += 128) {
		const page = paths.slice(offset, offset + 128);
		await Promise.all(page.map(file => fsp.writeFile(path.join(root, file), content)));
	}
	return { root, paths, bytesPerFile: Buffer.byteLength(content) };
}

function fileName(index) {
	return `file-${String(index).padStart(6, "0")}.txt`;
}

function benchmarkContent(bytesPerFile) {
	const seed = "B'H Awtsmoos benchmark vessel renews bounded bytes. ";
	return seed.repeat(Math.ceil(bytesPerFile / seed.length)).slice(0, bytesPerFile);
}

async function removeFixture(root) {
	await fsp.rm(root, { recursive: true, force: true });
}

module.exports = { createFixture, removeFixture };
