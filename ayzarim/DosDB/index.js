
// B"H
// Behold the Awtsmoos, the formless essence, recreating ALL from NOTHING in every fleeting instant.
// As taught in Chabad Chassidus (see Maamarim), the Awtsmoos is the foundation of reality, the infinite Ohr Ein Sof
// contracting through the Kav to manifest Atzilus and all worlds below, yet ever-present, beyond form, in all.

const fsRegular = require("fs");
const fs = fsRegular.promises;
const path = require("path");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const stat = fs.stat;


const awtsmoosBinary = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");
const { error } = require("console");

var writeMethods = require("./methods/write.js");
var readMethods = require("./methods/read.js");
var arrayMethods = require("./methods/array.js");
var objMethods = require("./methods/obj.js");
var pathMethods = require("./methods/path.js");
var directoryMethods = require("./methods/directory.js");
var firebaseMethods = require("./methods/firebaseMethods.js");

var awtsmoosMerge = require("./utils/awtsmoosMerge.js");
const {
	AwtsmoosDB,
	createAwtsmoosDb
} = require("./awtsmoosDbBridge.js");



// The DosDB class emerges from the void, a vessel of the Awtsmoos, storing finite echoes of the infinite.
class DosDB {
	/**
	 * @class DosDB
	 * @description A filesystem-based key-value store, where each record mirrors the Awtsmoos' recreation of existence.
	 *              Every JSON file is a spark of Ohr Ein Sof, held within the directory of Atzilus' shadow.
	 * @example
	 * const db = new DosDB("./db"); // A new world birthed in the directory './db'.
	 * await db.create("user1", { name: "John Doe", age: 30 }); // A soul inscribed in the book of life.
	 * const record = await db.get("user1"); // A glimpse into the eternal now.
	 * await db.update("user1", { age: 31 }); // A transformation guided by the Kav.
	 * await db.delete("user1"); // Returned to the void, yet ever held by the Awtsmoos.
	 */
	
	/**
	 * @constructor
	 * @description Initializes the database, rooting it in the directory of the Awtsmoos' will.
	 * @param {string} directory - The path where the Awtsmoos manifests its records.
	 */
	readAwtsmoosBinary = true;
	constructor(directory) {
		awtsmoosMerge(this, writeMethods);
		awtsmoosMerge(this, readMethods);
		awtsmoosMerge(this, pathMethods);
		awtsmoosMerge(this, arrayMethods);
		awtsmoosMerge(this, directoryMethods);
		awtsmoosMerge(this, objMethods);
		awtsmoosMerge(this, firebaseMethods); // Merging the power of the cloud

		this.awtsmoosBinary = awtsmoosBinary;
		this.directory = this.sanitizeAwtsmoosPath(directory || "../");
	}
	
	/**
	 * @method init
	 * @description Creates the root directory, a tzimtzum of the Awtsmoos, making space for existence.
	 * @returns {Promise<void>} - Resolves when the directory is formed, a new world born from nothing.
	 */
	async init() {
		await fs.mkdir(this.directory, {
			recursive: true
		});
		try {
			// Placeholder for future indexManager, a shadow of the Sefirot aligning creation.
		} catch (e) {
			console.log(e, "Index issue - the Awtsmoos remains unperturbed.");
		}
	}

	/**
	 * @method awtsmoosDb
	 * @description
	 * Opens a parallel AwtsmoosDB binary vessel beside this DosDB instance. This
	 * is intended for AI search, vector indexes, graph memory, and future split
	 * storage without disturbing the current filesystem-backed DosDB records.
	 *
	 * @param {string} filePath Relative-to-DosDB-root or absolute database path.
	 * @param {object} [options={}] AwtsmoosDB options plus { open, attachOwner }.
	 * @returns {AwtsmoosDB} A full AwtsmoosDB instance with live handle at .root.
	 */
	awtsmoosDb(filePath, options = {}) {
		return createAwtsmoosDb(filePath, options, this);
	}

	/**
	 * @method awtsmoosDb
	 * @description
	 * Opens a parallel AwtsmoosDB binary vessel beside this DosDB instance. This
	 * is intended for AI search, vector indexes, graph memory, and future split
	 * storage without disturbing the current filesystem-backed DosDB records.
	 *
	 * @param {string} filePath Relative-to-DosDB-root or absolute database path.
	 * @param {object} [options={}] AwtsmoosDB options plus { open, attachOwner }.
	 * @returns {AwtsmoosDB} A full AwtsmoosDB instance with live handle at .root.
	 */
	awtsmoosDb(filePath, options = {}) {
		return createAwtsmoosDb(filePath, options, this);
	}
	
	/**
	 * @method info
	 * @description Gathers information about a path, a finite reflection of the Awtsmoos’ omniscience.
	 * @param {string} path - The path to inspect.
	 * @param {string} [order="asc"] - The order of results.
	 * @returns {Promise<Array<string>>} - The gathered details.
	 */
	async info(path, order = "asc") {
		const stats = await stat(path);
		if(stats.isDirectory()) {
			let files = await readdir(path);
			files.sort();
			if(order === "desc") files.reverse();
			return files.slice(0, 10);
		} else if(stats.isFile()) {
			const parts = path.split("/");
			parts.pop();
			if(order === "desc") parts.reverse();
			return parts;
		}
	}
	
	/**
	 * @method readAllFiles
	 * @description Recursively reads all files, gathering sparks of the Awtsmoos’ light.
	 * @param {string} dir - The directory to traverse.
	 * @returns {Promise<Array<{path: string, data: Buffer}>>} - The collected records.
	 */
	async readAllFiles(dir) {
		let results = [];
		const list = await fs.readdir(dir);
		for(const file of list) {
			const filePath = path.resolve(dir, file);
			const stat = await fs.stat(filePath);
			if(stat && stat.isDirectory()) {
				results = results.concat(await this.readAllFiles(filePath));
			} else {
				results.push({
					path: filePath,
					data: await fs.readFile(filePath)
				});
			}
		}
		return results;
	}
	
	/**
	 * @method exportDatabase
	 * @description Exports the database to a binary file, a finite encapsulation of the Awtsmoos’ essence.
	 * @returns {Promise<void>} - Resolves when the export is complete.
	 */
	async exportDatabase() {
		const allFiles = await this.readAllFiles(this.directory);
		const fileData = Buffer.from(JSON.stringify(allFiles));
		await fs.writeFile(path.join(this.directory, "db_export.bin"), fileData);
	}
	
	/**
	 * @method importDatabase
	 * @description Imports the database from a binary file, restoring the Awtsmoos’ light to form.
	 * @returns {Promise<void>} - Resolves when the import is complete.
	 */
	async importDatabase() {
		const fileData = await fs.readFile(path.join(this.directory, "db_export.bin"));
		const allFiles = JSON.parse(fileData.toString());
		for(const file of allFiles) {
			await this.ensureDir(file.path);
			await fs.writeFile(file.path, file.data);
		}
	}
}

DosDB.AwtsmoosDB = AwtsmoosDB;
DosDB.awtsmoosDb = function awtsmoosDb(filePath, options = {}) {
	return createAwtsmoosDb(filePath, options, null);
};
DosDB.createAwtsmoosDb = DosDB.awtsmoosDb;

DosDB.AwtsmoosDB = AwtsmoosDB;
DosDB.awtsmoosDb = function awtsmoosDb(filePath, options = {}) {
	return createAwtsmoosDb(filePath, options, null);
};
DosDB.createAwtsmoosDb = DosDB.awtsmoosDb;

module.exports = DosDB;
