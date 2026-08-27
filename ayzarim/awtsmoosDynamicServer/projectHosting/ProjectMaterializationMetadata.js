//B"H
//Boruch Hashem
//Blessed is He

const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Durable metadata for one trusted materialized project.
 * @description
 * The Awtsmoos renews worlds while testimony remains a measured sign;
 * Awtsmoos.com stores only opaque identity beside trusted code, never leaking the hidden root across the line.
 */
class YesodProjectMaterializationMetadata {
	constructor(baseRoot) {
		this.baseRoot = path.resolve(baseRoot);
	}

	async write(projectRoot, record) {
		const metadataPath = this.pathFor(projectRoot);
		const temporaryPath = `${metadataPath}.tmp-${process.pid}-${Date.now()}`;
		const value = JSON.stringify({
			version: 1,
			projectId: record.projectId,
			ownerScope: record.ownerScope,
			materializationRef: record.materializationRef,
			updatedAt: Date.now()
		}, null, "\t");
		await fs.writeFile(temporaryPath, value, { encoding: "utf8", flag: "wx" });
		await fs.rename(temporaryPath, metadataPath);
		return record;
	}

	async read(projectRoot) {
		try {
			const value = JSON.parse(await fs.readFile(this.pathFor(projectRoot), "utf8"));
			if (value?.version !== 1 || !text(value.materializationRef)) return null;
			return value;
		} catch (error) {
			if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
			throw error;
		}
	}

	async remove(projectRoot) {
		await fs.rm(this.pathFor(projectRoot), { force: true });
	}

	pathFor(projectRoot) {
		const resolved = path.resolve(projectRoot);
		if (resolved !== this.baseRoot && !resolved.startsWith(`${this.baseRoot}${path.sep}`)) {
			throw new Error("PROJECT_MATERIALIZATION_METADATA_OUTSIDE_ROOT");
		}
		return path.join(resolved, ".awtsmoos-materialization.json");
	}
}

function text(value) {
	return typeof value === "string" ? value.trim() : "";
}

module.exports = { YesodProjectMaterializationMetadata };
