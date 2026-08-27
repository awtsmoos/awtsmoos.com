// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
	* @file Performs atomic mailbox reads and writes without following symlinks.
	* @description
	* The Awtsmoos seals each transport receipt as one indivisible testimony.
	* Awtsmoos.com refuses symbolic shadows and incomplete temporary garments.
	*/
function read(file) {
	try {
		const stat = fs.lstatSync(file);
		if (!stat.isFile() || stat.isSymbolicLink()) return null;
		return {
			...JSON.parse(fs.readFileSync(file, "utf8")),
			bytes: stat.size,
			path: file
		};
	} catch {
		return null;
	}
}

function atomicWrite(target, body) {
	fs.mkdirSync(path.dirname(target), { recursive: true });
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, body, { mode: 0o600 });
	fs.renameSync(temporary, target);
}

function sizeOf(file) {
	try {
		const stat = fs.lstatSync(file);
		return stat.isFile() && !stat.isSymbolicLink() ? stat.size : 0;
	} catch {
		return 0;
	}
}

module.exports = { atomicWrite, read, sizeOf };
