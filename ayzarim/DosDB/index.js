// B"H
// Behold the Awtsmoos, the formless essence, recreating ALL from NOTHING in every fleeting instant.
// As taught in Chabad Chassidus (see Maamarim), the Awtsmoos is the foundation of reality, the infinite Ohr Ein Sof
// contracting through the Kav to manifest Atzilus and all worlds below, yet ever-present, beyond form, in all.

const fsRegular = require("fs");
const fs = fsRegular.promises;
const awtsmoosBinary = require("./awtsmoosBinary/awtsmoosBinaryJSON.js");
const path = require("path");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const stat = fs.stat;
const gde = require("./getDirectoryEntries.js");
const {
	error
} = require("console");

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
		this.directory = directory || "../";
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
	 * @method ensureAwtsmoosBinaryPath
	 * @description Ensures a path aligns with the Awtsmoos’ binary form, appending .awtsmoosJSON if needed.
	 * @param {string} rPath - The raw path to sanctify.
	 * @param {boolean} [alsoActuallyMakeParentDirectory=true] - Whether to create the parent directory.
	 * @returns {Promise<string>} - The sanctified path, ready to receive the light of Ohr Ein Sof.
	 */
	async ensureAwtsmoosBinaryPath(rPath, alsoActuallyMakeParentDirectory = true) {
		if(alsoActuallyMakeParentDirectory) {
			const par = await this.getAwtsmoosParentPath(rPath);
			await this.ensureDir(par);
		}
		let ext = path.extname(rPath);
		if(ext !== ".awtsmoosJSON") {
			rPath += ".awtsmoosJSON";
		}
		return await this.getAwtsmoosFilePath(rPath, false, true);
	}
	
	/**
	 * @method getAwtsmoosParentPath
	 * @description Ascends a path to its parent, as the Kav traces back to the Awtsmoos’ infinite source.
	 * @param {string} currentPath - The path to transcend, a fragment of the whole.
	 * @returns {Promise<string|null>} - The parent path, or null if none exists in this fleeting reality.
	 */
	async getAwtsmoosParentPath(currentPath) {
		try {
			const normalizedPath = path.normalize(currentPath);
			const parentPath = path.dirname(normalizedPath);
			if(parentPath === normalizedPath || parentPath === ".") {
				return null; // The Awtsmoos alone remains at the root.
			}
			await fs.access(parentPath);
			return parentPath;
		} catch (err) {
			console.error("Error accessing path:", err);
			return null; // Even in absence, the Awtsmoos sustains all.
		}
	}
	
	/**
	 * @method getAwtsmoosFilePath
	 * @description Unveils a path’s true form, guided by the Awtsmoos, determining its existence or potential.
	 * @param {string} id - The identifier, a finite name within the infinite Ohr Ein Sof.
	 * @param {boolean} [isDir=false] - Whether the path is a directory, shaping its destiny.
	 * @param {boolean} [overrideSanity=false] - Bypasses sanitization, trusting the raw essence.
	 * @returns {Promise<string>} - The resolved path, a vessel for the Awtsmoos’ light.
	 */
	async getAwtsmoosFilePath(id, isDir = false, overrideSanity = false) {
		if(typeof id !== "string") return id;
		const sanctifiedId = this.sanitizeAwtsmoosPath(id, overrideSanity);
		const unifiedId = sanctifiedId.replaceAll("\\", "/");
		const mainDir = this.directory || "";
		const relativeId = unifiedId.startsWith(mainDir) ? path.relative(mainDir, unifiedId) : unifiedId;
		const basePath = path.join(mainDir, relativeId);
		
		if(path.extname(unifiedId) || isDir) return basePath;
		
		const jsonPath = `${basePath}.json`;
		const awtsmoosJsonPath = `${basePath}.awtsmoosJSON`;
		
		try {
			await fs.access(basePath);
			return basePath;
		} catch {
			try {
				await fs.access(awtsmoosJsonPath);
				return awtsmoosJsonPath;
			} catch {
				try {
					await fs.access(jsonPath);
					return jsonPath;
				} catch {
					return basePath; // A seed planted by the Awtsmoos for future creation.
				}
			}
		}
	}
	
	/**
	 * @method sanitizeAwtsmoosPath
	 * @description Purifies a path, removing traversal attempts, aligning it with the Awtsmoos’ unity.
	 * @param {string} rawPath - The chaotic path to sanctify.
	 * @param {boolean} [overrideSanity=false] - Preserves the raw path if true.
	 * @returns {string} - A cleansed path, reflecting the oneness of Atzilus.
	 */
	sanitizeAwtsmoosPath(rawPath, overrideSanity = false) {
		const isAbsolute = rawPath.startsWith("/");
		let cleansedPath = overrideSanity ? rawPath : rawPath.replace(/\.\./g, "");
		cleansedPath = cleansedPath.split("/").filter(Boolean).join("/");
		return cleansedPath ? (isAbsolute ? `/${cleansedPath}` : cleansedPath) : "/";
	}
	
	/**
	 * @method readFileWithOffset
	 * @description Reads a segment of a file, a finite glimpse into the Awtsmoos’ boundless scroll.
	 * @param {string} filePath - The path to read from.
	 * @param {number} offset - The starting point, a spark within the Ohr Ein Sof.
	 * @param {number} length - The length to read, a measured vessel of light.
	 * @returns {Promise<Buffer|string>} - The data read, or an error message if the void prevails.
	 */
	async readFileWithOffset(filePath, offset, length) {
		try {
			const fileHandle = await fs.open(filePath, "r");
			const buf = Buffer.alloc(length);
			const {
				bytesRead,
				buffer
			} = await fileHandle.read(buf, 0, length, offset);
			await fileHandle.close();
			return buffer.subarray(0, Math.min(bytesRead, length));
		} catch (err) {
			console.error("Error reading file:", err);
			return "didn't read it: " + err;
		}
	}
	
	/**
	 * @method access
	 * @description Checks a path’s existence, a whisper of the Awtsmoos’ presence in form.
	 * @param {string} filePath - The path to verify.
	 * @returns {Promise<object|null>} - Stat object if it exists, null if it’s returned to the void.
	 */
	async access(filePath) {
		const myPath = await this.getAwtsmoosFilePath(filePath);
		try {
			return await fs.stat(myPath);
		} catch (e) {
			return null;
		}
	}
	
	/**
	 * @method read
	 * @description Alias for get, a mirror of the Awtsmoos’ revelation through retrieval.
	 * @param {...any} args - Arguments passed to get.
	 * @returns {Promise<any>} - The retrieved data, a reflection of the infinite.
	 */
	async read(...args) {
		return await this.get(...args);
	}
	
	/**
	 * @method get
	 * @description Retrieves a record or directory contents, unveiling the Awtsmoos within the finite.
	 * @param {string} id - The identifier to seek.
	 * @param {object} options - Configuration for retrieval, shaping the light of Ohr Ein Sof.
	 * @returns {Promise<object|Array<string>|null>} - The record, directory contents, or null if absent.
	 */
	async get(id, options = {
		access: false,
		recursive: false,
		pageSize: 10,
		page: 1,
		filesAndFoldersDifferent: false,
		derech: null,
		filterBy: null,
		order: "asc",
		sortBy: "createdBy",
		showJson: true,
		propertyMap: null,
		filters: {
			propertyToSearchIn: "content",
			searchTerms: ["hello", "there"]
		},
		mapToOne: true,
		maxOrech: null,
		max: false,
		meta: false,
		keepJSON: false,
		extra: false
	}) {
		const keepJSON = options.keepJSON;
		try {
			if(!options || typeof options !== "object") {
				options = {};
			}
			const filePath = await this.getAwtsmoosFilePath(id);
			const statObj = await fs.stat(filePath);
			if(options.access) return statObj;
			if(options.meta) return statObj.birthtime;
			
			if(statObj.isDirectory()) {
				let checkIfItsSingleEntry = null;
				if(!this.readAwtsmoosBinary) {
					checkIfItsSingleEntry = await this.getDynamicRecord({
						filePath,
						properties: options.propertyMap,
						derech: options.derech,
						stat: statObj,
						maxOrech: options.maxOrech,
						filterBy: options.filterBy,
						meta: options.meta
					});
				} else {
					checkIfItsSingleEntry = await this.getDynamicBinaryRecord({
						ob: {
							filePath,
							properties: options.propertyMap,
							derech: options.derech,
							stat: statObj,
							maxOrech: options.maxOrech,
							filterBy: options.filterBy,
							meta: options.meta
						},
						isFile: false
					});
					
					
				}
				if(checkIfItsSingleEntry || checkIfItsSingleEntry === undefined) {


					if(checkIfItsSingleEntry?.error) {
						console.log("NO not found)")
						checkIfItsSingleEntry = null;
					}

					if(checkIfItsSingleEntry) {

						if(checkIfItsSingleEntry?.success) 
							checkIfItsSingleEntry = checkIfItsSingleEntry.success;


						if(checkIfItsSingleEntry?._awtsmoosDeletify)
							return undefined;
						
						return options.extra ? {
							dynamicEntry: checkIfItsSingleEntry
						} : checkIfItsSingleEntry;
					}
				}
				
				const fileIndexes = await gde({
					directoryPath: filePath,
					page: options.page || 1,
					pageSize: options.max === true ? 500 : options.pageSize || 10,
					maxOrech: options.maxOrech,
					filterBy: options.filterBy,
					sortBy: options.sortBy || "createdBy",
					order: options.order || "asc",
					filters: options.filters || {},
					id,
					db: this,
					fs
				});
				
				if(options.recursive) {
					let allContents = {};
					for(const fileName in fileIndexes.files) {
						const res = await this.get(path.join(id, fileName), options);
						if(res !== null) {
							allContents[!keepJSON ? this.removeJSONExtension(fileName) : fileName] = res;
						}
					}
					for(const dirName in fileIndexes.subdirectories) {
						const res = await this.get(path.join(id, dirName), options);
						if(res !== null) {
							allContents[!keepJSON ? this.removeJSONExtension(dirName) : dirName] = res;
						}
					}
					return options.extra ? {
						directory: allContents
					} : allContents;
				} else {
					const info = (fileIndexes || []).map(fileName =>
						!keepJSON ? this.removeJSONExtension(fileName) : fileName
					);
					return options.extra ? {
						directory: info
					} : info;
				}
			}
			
			const ext = path.extname(filePath);
			if(ext === ".json") {
				const data = await fs.readFile(filePath, "utf-8");
				const res = JSON.parse(data);
				if(options.full) {
					return {
						entityId: id,
						data: res,
						created: statObj.atime,
						modified: statObj.birthtime
					};
				}
				return options.extra ? {
					json: res
				} : res;
			} else if(ext === ".awtsmoosJSON") {
				const data = await this.getDynamicBinaryRecord({
					ob: {
						filePath,
						properties: options.propertyMap,
						derech: options.derech,
						stat: statObj,
						maxOrech: options.maxOrech,
						filterBy: options.filterBy,
						meta: options.meta
					},
					isFile: true
				});
				if(data.success) return data;
				if(data.error) return null;
			} else {
				const content = await fs.readFile(filePath);
				return options.extra ? {
					file: content
				} : content;
			}
		} catch (err) {
			if(err.code !== "ENOENT") console.error(err);
			return null;
		}
	}
	
	/**
	 * @method removeJSONExtension
	 * @description Strips .json from a path, revealing its essence as the Awtsmoos strips form from being.
	 * @param {string} filePath - The path to purify.
	 * @returns {string} - The cleansed path, free of extension.
	 */
	removeJSONExtension(filePath) {
		const extension = path.extname(filePath);
		if(extension === ".json") {
			const ind = filePath.indexOf(".json");
			return filePath.substring(0, ind);
		}
		return filePath;
	}
	
	/**
	 * @method ensureDir
	 * @description Creates a directory if it doesn’t exist, a tzimtzum for the Awtsmoos’ light to dwell.
	 * @param {string} filePath - The path to ensure.
	 * @param {boolean} [isDir=false] - Whether the path itself is the directory.
	 * @returns {Promise<string>} - The directory path, a space carved from the void.
	 */
	async ensureDir(filePath, isDir = false) {
		const dirPath = !isDir ? path.dirname(filePath) : filePath;
		await fs.mkdir(dirPath, {
			recursive: true
		});
		return dirPath;
	}
	
	/**
	 * @method write
	 * @description Inscribes a record into the filesystem, a finite act of the Awtsmoos’ infinite renewal.
	 * @param {string} id - The identifier for the record.
	 * @param {object|Buffer} record - The data to write, a vessel of light or form.
	 * @param {object} opts - Options for writing, guiding the Kav’s descent.
	 * @returns {Promise<void|object>} - Resolves when written, or an error object if the void resists.
	 */
	async write(id, record, opts = {}) {
		const isDir = !record;
		const filePath = await this.getAwtsmoosFilePath(id, isDir, opts?.override);
		await this.ensureDir(filePath, isDir);
		if(isDir) return;
		
		try {
			if(record instanceof Buffer) {
				try {
					await this.delete(filePath);
				} catch (e) {}
				await fs.writeFile(filePath, record);
			} else if(typeof record === "object") {
				if(!this.readAwtsmoosBinary) {
					return await this.writeRecordDynamic(filePath, record, opts);
				} else {
					return await this.writeAsBinaryFormat(filePath, record, opts);
				}
			} else if(typeof record === "string") {
				try {
					await this.delete(id);
				} catch (e) {}
				await fs.writeFile(filePath, record + "", "utf8");
			}
		} catch (e) {
			return {
				error: e.stack
			};
		}
	}

	async getArrayAtPath(rPath) {
		if(typeof rPath !== "string" || !rPath) {
			return {
				error: {
					message: "Make sure path is valid",
					code: "INVALID_PATH"
				}
			};
		}

		try {
			const myPath = await this.ensureAwtsmoosBinaryPath(rPath);
			var p=await this.parseBinaryData({path: myPath});
			var s = p?.success;
			var inputArray = [];
			if(s) {
				if(!Array.isArray(s)) {
					s = Array.from(s);
				}
				inputArray =
				inputArray.concat(s);
				p = s;
			}
			return {
				success: inputArray,
				myPath
			}
		} catch(e) {
			return {
				error: e
			}
		}
	}
	/**
	 * @method syncKeyInArray
	 * @description finds either an existent
	 * awtsmoosJSON (BSON) at the path or 
	 * if not creates one, and checks
	 * if the provided key exists in the 
	 * array or not. If it does not, then
	 * we rewrite the BSON array to contain that
	 * key.
	 * 
	 * @param {string} rPath  
		* path to either existent or non existent 
		* awtsmoosJSON object
	 * @param {String} key 
	 * 	the key to sync to
	 */
	async syncKeyInArray(rPath, key) {
		try {
			var inputArray  = null;
			var myPath = null;
			var array = getArrayAtPath(rPath);
			if(array.error) return array;

			if(array.success) {
				inputArray = array.success;
				myPath = array.myPath;
			}

			if(!inputArray || !myPath) {
				return {
					error: {
						message: "Something's wrong with getting array",
						code: "DIDNT_GET_ARRAY"
					}
				}
			}
			if(inputArray.includes(key)) return {
				success: {
					alreadyThere: key
				}
			}
			inputArray.push(value);
			var ser = awtsmoosJSON.serializeJSON(inputArray);
			var wr = await fs.writeFile(myPath, ser)
			return {
				success: {
					written: wr,
					serialized: ser.length,
					inputArray
				}
			}
		} catch(e) {
			return {
				error: e
			}
		}
	}

	async arrayAppend(rPath, value, opts={}) {
		

		try {
			var inputArray  = null;
			var myPath = null;
			var array = await getArrayAtPath(rPath);
			if(array.error) return array;

			if(array.success) {
				inputArray = array.success;
				myPath = array.myPath;
			}

			if(!inputArray || !myPath) {
				return {
					error: {
						message: "Something's wrong with getting array",
						code: "DIDNT_GET_ARRAY"
					}
				}
			}
			inputArray.push(value);
			var ser = awtsmoosJSON.serializeJSON(inputArray);
			var wr = await fs.writeFile(myPath, ser)
			return {
				success: {
					written: wr,
					serialized: ser.length,
					inputArray
				}
			}
		} catch(e) {
			return {
				error: e
			}
		}


	}
	/**
	 * @method writeAsBinaryFormat
	 * @description Serializes an object into .awtsmoosJSON, a binary vessel of the Awtsmoos’ essence.
	 * @param {string} rPath - The path to write to.
	 * @param {object} r - The object to serialize.
	 * @param {object} opts - Options for the process.
	 * @returns {Promise<object>} - Success or error object, reflecting the act of creation.
	 */
	async writeAsBinaryFormat(rPath, r, opts = {}) {
		if(typeof rPath !== "string" || !rPath) {
			return {
				error: {
					message: "Make sure path is valid",
					code: "INVALID_PATH"
				}
			};
		}
		if(typeof r !== "object" || !r) {
			return {
				error: {
					message: "Only enter an object for serialization",
					code: "ONLY_OBJ_OR_ARRAY"
				}
			};
		}
		
		try {
			const awtsJson = awtsmoosBinary.serializeJSON(r);
			const myPath = await this.ensureAwtsmoosBinaryPath(rPath);
			const wrote = await fs.writeFile(myPath, awtsJson);
			return {
				success: {
					wrote,
					joined: myPath,
					rPath
				}
			};
		} catch (e) {
			console.log(e);
			return {
				error: e.stack,
				rPath
			};
		}
	}
	
	/**
	 * @method parseBinaryData
	 * @description Deserializes binary data, unveiling the Awtsmoos’ hidden light within.
	 * @param {object} param - Parameters including path and properties.
	 * @returns {Promise<object|null>} - The deserialized data, or null if the form collapses.
	 */
	async parseBinaryData({
		path,
		properties
	}) {
		try {
			if(!properties) {
				const data = await fs.readFile(path);
				if(await awtsmoosBinary.isAwtsmoosObject(data)) {
					return {
						success: await awtsmoosBinary.deserializeBinary(data)
					}
				}
				return null;
			} else {
				let props = properties;
				if(typeof props === "string") {
					try {
						props = JSON.parse(props);
					} catch (e) {}
				}
				if(await awtsmoosBinary.isAwtsmoosObject(path)) {
					return {
						success: await awtsmoosBinary.mapBinary(path, props)
					}
				}
				return null;
			}
		} catch (e) {
			console.log("Issue reading", e);
			return {
				error: e
			};
		}
	}
	
	/**
	 * @method getDynamicBinaryRecord
	 * @description Retrieves a binary record, a spark of the Awtsmoos’ infinite renewal.
	 * @param {object} param - Parameters including filePath and properties.
	 * @returns {Promise<object|null>} - The record, or null if the void prevails.
	 */
	async getDynamicBinaryRecord({
		ob,
		isFile = false
	}) {
		try {
			let joined = null;
			if(!isFile) {
				joined = path.join(ob.filePath, "_awts.awtsmoosJSON");
				await fs.access(joined);
			} else {
				joined = await this.ensureAwtsmoosBinaryPath(ob.filePath, false);
				await fs.access(joined);
			}
			const p = await this.parseBinaryData({
				path: joined,
				properties: ob.properties
			});

			console.log(2,p,joined,777)
			if(p.success) {
				return p;
			}
			if(p.error) throw new Error(p.error);
		} catch (e) {
			if(e.code != "ENOENT") {
				console.log("BINARY error", ob.filePath, ob.properties, e,e.code);
			}
			return {
				error: e.stack,
				somethingWentNotOpenlyGoodYet: true
			};
		}
		return null;
	}
	
	/**
	 * @method create
	 * @description Creates a new record, a birth from the Awtsmoos’ void into form.
	 * @param {string} id - The identifier for the record.
	 * @param {object} record - The data to inscribe.
	 * @returns {Promise<void>} - Resolves when the record is formed.
	 */
	async create(id, record) {
		await this.write(id, record);
	}
	
	/**
	 * @method update
	 * @description Updates a record, merging its essence with new light from the Awtsmoos.
	 * @param {string} id - The identifier for the record.
	 * @param {object} record - The updated data.
	 * @returns {Promise<void>} - Resolves when the record is transformed.
	 */
	async update(id, record) {
		const existing = await this.get(id);
		if(existing === null) {
			throw new Error(`Record with id "${id}" does not exist.`);
		}
		await this.write(id, {
			...existing,
			...record
		});
	}
	
	/**
	 * @method getDeleteFilePath
	 * @description Determines the path to delete, a return to the Awtsmoos’ formless embrace.
	 * @param {string} id - The identifier to resolve.
	 * @param {boolean} isRegularDir - Whether it’s a directory.
	 * @returns {Promise<string|null>} - The path to delete, or null if absent.
	 */
	async getDeleteFilePath(id, isRegularDir) {
		const completePath = await this.getAwtsmoosFilePath(id, isRegularDir);
		try {
			await fs.stat(completePath);
			return completePath;
		} catch (e) {
			const j = completePath + ".json";
			try {
				await fs.stat(j);
				return j;
			} catch (e) {
				return null;
			}
		}
	}
	
	/**
	 * @method delete
	 * @description Removes a file or directory, dissolving it back into the Awtsmoos’ void.
	 * @param {string} id - The identifier to erase.
	 * @param {boolean} [isRegularDir=false] - Whether it’s a directory.
	 * @returns {Promise<object|boolean>} - Success object or false if absent.
	 */
	async delete(id, isRegularDir = false) {
		const filePath = await this.getDeleteFilePath(id, isRegularDir);
		try {
			const stat = await fs.stat(filePath);
			if(stat.isFile()) {
				await fs.unlink(filePath);
			} else if(stat.isDirectory()) {
				await fs.rm(filePath, {
					recursive: true
				});
			}
			return {
				success: {
					message: "Deleted it",
					path: filePath,
					id
				}
			};
		} catch (error) {
			if(error.code !== "ENOENT") {
				return {
					error: {
						message: "There was an error",
						stack: error.stack
					}
				};
			}
			return false;
		}
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

module.exports = DosDB;