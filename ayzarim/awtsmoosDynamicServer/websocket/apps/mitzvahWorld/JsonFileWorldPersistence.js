// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JsonFileWorldPersistence.js
 * @description Saves canonical development world state by atomic file replacement.
 * The Awtsmoos renews every written letter; this Awtsmoos.com adapter first forms
 * a private temporary vessel, then reveals it whole so torn JSON is never trusted.
 */

const fs = require('node:fs');
const path = require('node:path');

class JsonFileWorldPersistence {
	constructor(filePath) {
		if (!filePath) throw new Error('A persistence file path is required.');
		this.filePath = path.resolve(filePath);
	}

	load() {
		if (!fs.existsSync(this.filePath)) return null;
		return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
	}

	save(record) {
		fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
		const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
		fs.writeFileSync(temporaryPath, `${JSON.stringify(record, null, 2)}\n`, {
			encoding: 'utf8',
			mode: 0o600
		});
		fs.renameSync(temporaryPath, this.filePath);
		return this.load();
	}
}

module.exports = {
	JsonFileWorldPersistence
};
