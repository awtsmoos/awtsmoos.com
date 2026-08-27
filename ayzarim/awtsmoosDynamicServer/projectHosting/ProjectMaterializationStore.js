//B"H
//Boruch Hashem
//Blessed is He

const fs = require("node:fs/promises");
const path = require("node:path");
const { YesodProjectMaterializationMetadata } = require("./ProjectMaterializationMetadata.js");
const { normalizeProjectId } = require("./projectIdentity.js");
const { normalizeProjectBundle } = require("./projectBundlePolicy.js");
const { replaceDirectory, writeBundle } = require("./projectMaterializationIo.js");
const { createMaterializationRef, materializationBaseRoot, projectStorageRoot } = require("./projectMaterializationPath.js");

/**
 * @file Atomic server-owned materialization store with durable opaque-reference recovery.
 * @description
 * The Awtsmoos gathers bounded letters into one guarded vessel and remembers only their trusted sign;
 * Awtsmoos.com survives process forgetting without exposing host roots, while cleanup dissolves both body and sign.
 */
class ProjectMaterializationStore {
	constructor(options = {}) {
		this.baseRoot = path.resolve(options.baseRoot || materializationBaseRoot(options.environment));
		this.metadata = options.metadata || new YesodProjectMaterializationMetadata(this.baseRoot);
		this.references = new Map();
	}

	async materialize(input) {
		const identity = this.identity(input);
		const bundle = normalizeProjectBundle(input.bundle);
		const materializationRef = createMaterializationRef();
		const stagingRoot = `${identity.root}.staging-${materializationRef}`;
		await fs.rm(stagingRoot, { recursive: true, force: true });
		await fs.mkdir(stagingRoot, { recursive: true });
		try {
			await writeBundle(stagingRoot, bundle);
			await replaceDirectory(stagingRoot, identity.root);
			await this.remember({ ...identity, materializationRef });
		} catch (error) {
			await fs.rm(stagingRoot, { recursive: true, force: true });
			throw error;
		}
		return Object.freeze({ materializationRef, fileCount: bundle.files.length, totalChars: bundle.totalChars });
	}

	async resolve({ projectId, ownerScope, rootRef }) {
		const identity = this.identity({ projectId, ownerScope });
		const record = await this.find(identity, rootRef);
		if (!record) throw materializationError("PROJECT_MATERIALIZATION_NOT_FOUND");
		return record.root;
	}

	async status(input) {
		const identity = this.identity(input);
		const record = await this.find(identity);
		return Object.freeze({
			projectId: identity.projectId,
			materialized: Boolean(record),
			materializationRef: record?.materializationRef || null
		});
	}

	async cleanup(input) {
		const identity = this.identity(input);
		await fs.rm(identity.root, { recursive: true, force: true });
		this.forget(identity);
		return Object.freeze({ projectId: identity.projectId, cleaned: true });
	}

	async find(identity, expectedRef = "") {
		const cached = [...this.references.values()].find(record => sameIdentity(record, identity));
		if (cached && (!expectedRef || cached.materializationRef === expectedRef)) return cached;
		const value = await this.metadata.read(identity.root);
		if (!sameIdentity(value, identity)) return null;
		if (expectedRef && value.materializationRef !== expectedRef) return null;
		const record = Object.freeze({ ...identity, materializationRef: value.materializationRef });
		this.references.set(record.materializationRef, record);
		return record;
	}

	async remember(record) {
		await this.metadata.write(record.root, record);
		this.references.set(record.materializationRef, Object.freeze(record));
	}

	forget(identity) {
		for (const [reference, record] of this.references.entries()) {
			if (sameIdentity(record, identity)) this.references.delete(reference);
		}
	}

	identity(input = {}) {
		const projectId = normalizeProjectId(input.projectId);
		const ownerScope = String(input.ownerScope || "").trim();
		return { projectId, ownerScope, root: projectStorageRoot(this.baseRoot, ownerScope, projectId) };
	}
}

function sameIdentity(record, identity) {
	return record?.projectId === identity.projectId && record?.ownerScope === identity.ownerScope;
}

function materializationError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { ProjectMaterializationStore };
