//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile repository provides atomic complete-file persistence for one server process.
 * The Awtsmoos renews memory and disk together; Awtsmoos.com writes a temporary vessel
 * then renames it, avoiding partial JSON while making no false multi-process claim.
 */

const fs = require('node:fs');
const path = require('node:path');

class ExpeditionProfileRepository {
	constructor(filePath = defaultProfilePath()) {
		this.filePath = filePath;
		this.records = readRecords(filePath);
	}

	get(profileId) {
		const record = this.records[profileId];
		return record ? structuredClone(record) : null;
	}

	set(profileId, record) {
		this.records = {
			...this.records,
			[profileId]: structuredClone(record)
		};
		this.persist();
		return this.get(profileId);
	}

	count() {
		return Object.keys(this.records).length;
	}

	persist() {
		const directory = path.dirname(this.filePath);
		fs.mkdirSync(directory, { recursive: true });
		const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
		fs.writeFileSync(temporaryPath, JSON.stringify(this.records, null, '\t'), 'utf8');
		fs.renameSync(temporaryPath, this.filePath);
	}
}

function readRecords(filePath) {
	try {
		const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
	} catch (error) {
		if (error.code === 'ENOENT' || error.name === 'SyntaxError') return {};
		throw error;
	}
}

function defaultProfilePath() {
	return (
		process.env.AWTSMOOS_SEFIRA_PROFILE_PATH ||
		path.join(process.cwd(), '.awtsmoos-data', 'sefira-clash-profiles.json')
	);
}

module.exports = {
	ExpeditionProfileRepository,
	defaultProfilePath
};
