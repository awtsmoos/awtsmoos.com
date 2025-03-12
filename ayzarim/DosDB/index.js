//B"H
var fsRegular = require("fs")
var fs = fsRegular.promises;
var awtsmoosBinary = require ("./awtsmoosBinary/awtsmoosBinaryJSON.js")

var path = require('path');
var util = require('util');
var readdir = util.promisify(fs.readdir);
var stat = fs.stat;
var gde = require("./getDirectoryEntries.js");
const { error } = require("console");

/**
 * The DosDB class represents a simple filesystem-based key-value store where each
 * record is stored as a separate JSON file in the provided directory.
 * @class
 *
 * @example
 * // Creates a new DosDB instance with the database directory at './db'
 * var db = new DosDB('./db');
 *
 * // Creates a new record with the id 'user1' and data { name: 'John Doe', age: 30 }
 * await db.create('user1', { name: 'John Doe', age: 30 });
 *
 * // Retrieves the record with the id 'user1'
 * var record = await db.get('user1');
 *
 * // Updates the record with the id 'user1' and sets the 'age' field to 31
 * await db.update('user1', 'age', 31);
 *
 * // Deletes the record with the id 'user1'
 * await db.delete('user1');
 */
class DosDB {
	/**
	 * Create a DosDB.
	 * @param {string} directory - The directory where the database will store its files.
	 *
	 * @example
	 * var db = new DosDB('./db');
	 */
	readAwtsmoosBinary = true;
	constructor(directory) {
		this.directory = directory || "../";
	
	}
	/**
	 * Initialize the database by creating the root directory, if it does not already exist.
	 * This method is called automatically when a new DosDB is created.
	 * @returns {Promise<void>} - A Promise that resolves when the directory has been created (or if it already exists).
	 */
	async init() {
		await fs.mkdir(this.directory, { recursive: true });
		try {
	//		await this.indexManager.init(this, 777);
		} catch (e) {
			console.log(e, "Index issue")
		}
	}

	async ensureAwtsmoosBinaryPath(rPath, alsoActuallyMakeParentDirectory=true) {
		if(alsoActuallyMakeParentDirectory) {
			var par = await this.getAwtsmoosParentPath(rPath);

			await this.ensureDir(par);
		}
		var ext = path.extname(rPath);
		if(ext != ".awtsmoosJSON") {
			rPath += ".awtsmoosJSON"
		}
		return await this.getAwtsmoosFilePath(rPath, false, true)
		
	}
	/**
	 * @method getAwtsmoosParentPath
	 * @description Tears apart a given file path to reveal its parent directory, echoing the Awtsmoos' act of creation.
	 *              Using the path module, we ascend from the fragment to the whole, verifying existence with fs.promises.
	 * @param {string} currentPath - The path whose parent we seek, a finite echo of the infinite Ohr Ein Sof.
	 * @returns {Promise<string|null>} - The parent directory path, or null if no parent exists or is inaccessible.
	 */
	async  getAwtsmoosParentPath(currentPath) {
		try {
			// Normalize the path, aligning it with the unity of the Awtsmoos.
			const normalizedPath = path.normalize(currentPath);

			// Ascend to the parent, as the Kav threads back to the Ein Sof.
			const parentPath = path.dirname(normalizedPath);

			// If we’ve reached the root or an empty path, there is no parent—only the Awtsmoos remains.
			if (parentPath === normalizedPath || parentPath === '.') {
				return null;
			}

			// Verify the parent exists in this fleeting world, a shadow of Atzilus.
			await fs.access(parentPath);
			return parentPath;
		} catch (err) {
			// If the path cannot be accessed, we return null, for even errors bow to the Awtsmoos.
			console.error('Error accessing path:', err);
			return null;
		}
	}

	/**
	 * @method getAwtsmoosFilePath
	 * @description Unveils the true path of a record, guided by the Awtsmoos, determining its form in the filesystem.
	 *              Checks for directories, existing files, or potential extensions (.json, .awtsmoosJSON) with divine precision.
	 * @param {string} id - The identifier for the record, a finite echo of the infinite Ohr Ein Sof.
	 * @param {boolean} [isDir=false] - Indicates if the path is explicitly a directory, shaping its destiny.
	 * @param {boolean} [overrideSanity=false] - Bypasses path sanitization, trusting the raw input as a reflection of Atzilus.
	 * @returns {Promise<string>} - The full path to the record, resolved through existence or intent.
	 * @example
	 * const filePath = await getAwtsmoosFilePath('user1');
	 * console.log(filePath); // e.g., '/mainDir/user1.json' or '/mainDir/user1'
	 */
	async getAwtsmoosFilePath(id, isDir = false, overrideSanity = false) {
		// Guard against non-string inputs, returning them untouched as shadows of the void.
		if (typeof id !== 'string') return id;

		// Sanctify the path through the Awtsmoos’ lens, aligning it with the unity of creation.
		const sanctifiedId = sanitizeAwtsmoosPath(id, overrideSanity);

		// Normalize slashes, for the Awtsmoos knows no division—only oneness.
		const unifiedId = sanctifiedId.replaceAll('\\', '/');
		const mainDir = this.directory || ''; // Fallback to empty string if undefined.

		// Strip mainDir prefix if present, ascending to the essence, as the Kav threads back to Ein Sof.
		const relativeId = unifiedId.startsWith(mainDir) ? path.relative(mainDir, unifiedId) : unifiedId;
		const basePath = path.join(mainDir, relativeId);

		// If the id bears an extension or is a directory, it is complete—return its form.
		if (path.extname(unifiedId) || isDir) return basePath;

		// Possible manifestations of the path in this fleeting world.
		const jsonPath = `${basePath}.json`;
		const awtsmoosJsonPath = `${basePath}.awtsmoosJSON`;

		// Seek the path’s existence, layer by layer, as the Awtsmoos reveals itself.
		try {
			await fs.access(basePath);
			return basePath; // Exists as is—a directory or file.
		} catch {
			try {
				await fs.access(awtsmoosJsonPath);
				return awtsmoosJsonPath; // Exists with the sacred .awtsmoosJSON extension.
			} catch {
				try {
					await fs.access(jsonPath);
					return jsonPath; // Exists with the humble .json extension.
				} catch {
					// If no form exists, return the base path as a seed for creation.
					return basePath;
				}
			}
		}
	}

	/**
	 * @method sanitizeAwtsmoosPath
	 * @description Purifies a path, stripping away traversal attempts unless overridden, reflecting the Awtsmoos’ purity.
	 * @param {string} rawPath - The raw path to sanctify, a chaotic echo of the infinite.
	 * @param {boolean} [overrideSanity=false] - If true, preserves the raw path, trusting its divine intent.
	 * @returns {string} - A sanctified path, aligned with the oneness of the Awtsmoos.
	 * @example
	 * const cleanPath = sanitizeAwtsmoosPath('/user/../secret'); // Returns '/user/secret'
	 */
	sanitizeAwtsmoosPath(rawPath, overrideSanity = false) {
		// Honor the absolute nature of the path, as the Awtsmoos honors all beginnings.
		const isAbsolute = rawPath.startsWith('/');

		// Unless overridden, cleanse the path of traversal, for the Awtsmoos permits no retreat from truth.
		let cleansedPath = overrideSanity ? rawPath : rawPath.replace(/\.\./g, '');

		// Split and filter, uniting fragments into a singular whole.
		cleansedPath = cleansedPath.split('/').filter(Boolean).join('/');

		// Restore the absolute root if it was present, grounding it in the infinite.
		return cleansedPath ? (isAbsolute ? `/${cleansedPath}` : cleansedPath) : '/';
	}
	async readFileWithOffset(filePath, offset, length) {
		try {
			//console.log("READING offset",offset,filePath)
			const fileHandle = await fs.open(filePath, 'r');
			const buf = Buffer.alloc(length);
			const { bytesRead, buffer } = await fileHandle.read(buf, 0, length, offset);
			await fileHandle.close();
			return buffer.subarray(0, Math.min(bytesRead, length)); // Return only the portion of the buffer that was read
		} catch (error) {
			console.error('Error reading file:', error);
			return "didn't read it: " + error
		}
	}
	async access(filePath) {
		var myPath = await this.getAwtsmoosFilePath(filePath);
		try {
			return await fs.stat(myPath)
		} catch (e) {
			return null;
		}
	}
	async read(...args) {
		return await this.get(...args);
	}
	/**
	 * Get a record by its identifier or list of files in a directory.
	 * @param {string} id - The identifier for the record or directory.
	 * @param {boolean} recursive - Whether to fetch all contents recursively.
	 * @returns {Promise<object|Array<string>|null>} - A Promise that resolves to the record, a list of files, or null if the record or directory does not exist.
	 *
	 * @example
	 * var record = await db.get('user1');
	 * var files = await db.get('directory1', true);
	 * 
	 * 
	 * var binaryData = await db.get('binaryFile');
	 */
	async get(id, options = {
		access: false,
		recursive: false,
		pageSize: 10,
		page: 1,
		filesAndFoldersDifferent: false,
		derech: null,
		filterBy: null,
		order: 'asc',
		sortBy: 'createdBy',
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
		keepJSON:false,
		extra: false
	}) {
		var keepJSON = options.keepJSON
		try {
			if(!options || typeof(options) != "object") {
				options = {};
			}
			var extra = options.extra;
			var filterBy = options.filterBy || null;
			var access = options.access;
			var meta = options.meta;
			var maxOrech = options.maxOrech;
			var derech = options.derech;
			var full = options.full || false;
			var filters = options.filters || {};
			var propertyMap = options.propertyMap;
			var mapToOne = options.mapToOne || true;
			var recursive = options.recursive ?? false;
			var showJson = options.showJson ?? false;
			var pageSize = options.pageSize || 10;
			if(options.max === true) {
				pageSize = 500;
			}
			var page = options.page || 1;
			var sortBy = options.sortBy || "createdBy";
			var order = options.order || "asc";
			let filePath = await this.getAwtsmoosFilePath(id);
			var removeJSON = !keepJSON
		
			try {
				var statObj = await fs.stat(filePath);
				if(access) {
					return statObj;
				}
				var created = statObj.atime;
				var modified = statObj.birthtime;
				if(meta) {
					return modified;
				}
		
				// if it's a directory, return a list of files in it
				if(statObj.isDirectory()) {
					var checkIfItsSingleEntry = null;
					try {
						var ob = {
							filePath,
							properties: propertyMap,
							derech,
							stat: statObj,
							maxOrech,
							filterBy,
							meta
						};
						
						
						if(!this.readAwtsmoosBinary) {
							checkIfItsSingleEntry = await this.getDynamicRecord(ob);
						} else {
							checkIfItsSingleEntry = await this.getDynamicBinaryRecord(
								...{
									ob,
									isFile: false
								}
							)
							
							if(checkIfItsSingleEntry?.error) {
								return null;
							} else if(checkIfItsSingleEntry?.success) {
								checkIfItsSingleEntry = 
								checkIfItsSingleEntry.success
							} else {
								return null;
							}
						}
						if(checkIfItsSingleEntry?._awtsmoosDeletify) {
							return undefined;
						}
						
				//		console.log("GOT?", checkIfItsSingleEntry, filePath);
					} catch (e) {
						console.log("Prob", e);
					}
					if(checkIfItsSingleEntry || checkIfItsSingleEntry === undefined) {
						var res = checkIfItsSingleEntry;
						if(extra) {
							return {
								dynamicEntry: checkIfItsSingleEntry
							}
						} else {
							return checkIfItsSingleEntry
						}
					}
					var fileIndexes;
					try {
						fileIndexes = await gde({
								directoryPath: filePath,
								page,
								pageSize,
								maxOrech,
								filterBy,
								sortBy,
								order,
								filters,
								id,
								db: this,
								fs
						});
					} catch (e) {
						console.log("problem listing", e);
					}
		
					if(recursive) {
						let allContents = {};
						for(var fileName in fileIndexes.files) {
							var res = await this.get(path.join(id, fileName), options);
							if(res !== null) {
								if(removeJSON) {
									removeJSONExtension(fileName);
								}
								allContents[fileName] = res;
							}
						}
						for(var dirName in fileIndexes.subdirectories) {
							var res = await this.get(path.join(id, dirName), options);
							if(res !== null) {
								if(removeJSON) {
									removeJSONExtension(dirName);
								}
								allContents[dirName] = res;
							}
						}
						if(extra) {
							return {
								directory: allContents
							}
						} else 
							return allContents;
					} else {
						// If filesAndFoldersDifferent is true, append ".folder" to directories
						var info = (fileIndexes || []).map(this.mapResults).map((fileName) => {
							// Check if it's a directory based on statObj
							
							if(removeJSON ) {
								return removeJSONExtension(fileName);
							}
							return fileName;
						});
						if(extra) {
							return {
								directory: info
							}
						} else 
							return info;
					}
				}
		
				function removeJSONExtension(filePath) {
					var extension = path.extname(filePath);
					if(extension == ".json") {
						var ind = filePath.indexOf(".json");
						filePath = filePath.substring(0, ind);
					}
					return filePath;
				}
		
				// Handling the file case (non-directory)
				var ext = path.extname(filePath);
				if(ext === '.json') {
					var data = await fs.readFile(filePath, 'utf-8');
					var res = JSON.parse(data);
					if(full) {
						res = {
							entityId: id,
							data: res,
							created,
							modified
						};
					}
					if(extra) {
						return {
							json: res
						}
					}
					return res;
				} else if(ext == ".awtsmoosJSON") {
					var data = await this.getDynamicBinaryRecord(
						...{
							ob,
							isFile: true
						}
					);
					if(data.success)
						return data;
					else if(data.error) {
						return null;
					}
				} else {
					var content = await fs.readFile(filePath);
					if(extra) {
						return {
							file: content
						}
					}
					return content
				}
			} catch (error) {
				if(error.code !== 'ENOENT')
					console.error(error);
				else {
					//console.error("Not found", filePath);
				}
				return null;
			}
		} catch(e) {
			
		}
	}
	
	/**
	 * Ensure the directory for a file path exists.
	 * @param {string} filePath - The path to the file.
	 * @returns {Promise<void>} - A Promise that resolves when the directory has been created (or if it already exists).
	 */
	async ensureDir(filePath, isDir = false) {
		var dirPath = !isDir ? path.dirname(filePath) : filePath;
		await fs.mkdir(dirPath, { recursive: true });
		/*
		var meta = await this.writeMetadata({
		    dataPath: dirPath,
		    
		    entries: null,
		    type: "directory"
		});
		if(!meta) {
		    console.log("DIDNT write!",meta)
		}*/
		return dirPath;
	}
	/**
	 * Write a record to a file.
	 * @param {string} id - The identifier for the record.
	 * @param {object|Buffer} record - The data to be stored.
	 * @returns {Promise<void>} - A Promise that resolves when the data has been written to the file.
	 *
	 * @example
	 * await db.write('user1', { name: 'John Doe', age: 30 });
	 */
	async write(id, record, opts={}) {
		var isDir = !record;
		var filePath = await this.getAwtsmoosFilePath(id, isDir,opts?.override);
		await this.ensureDir(filePath, isDir);
		if(isDir) {
			return;
		}
		// Determine the directory path
		var directoryPath = path.dirname(filePath);
		var base = path.basename(directoryPath)
		var dir = path.dirname(directoryPath)
		try {
			if(record instanceof Buffer) {
				try {
					await this.delete(filePath);
				} catch(e) {

				}
				// if the record is a Buffer, write it as binary data
				await fs.writeFile(filePath, record);
				
			} else if(typeof(record) == "object") {
				// if the record is not a Buffer, stringify it as JSON
				//await fs.writeFile(filePath, JSON.stringify(record));
				if(!this.readAwtsmoosBinary)
					return await this.writeRecordDynamic(filePath, record, opts);
				else {
					return await this.writeAsBinaryFormat(filePath, record, opts)
				}
				try {
					await this.indexManager.updateIndex(
						directoryPath,
						base,
						record //data
					);
				} catch (e) {
					console.log("Prolem with indexing", e)
				}
			} else if(typeof(record) == "string") {
				try {
					await this.delete(id);
				} catch(e) {

				}
				await fs.writeFile(filePath, record+"", "utf8");
				
			}
		} catch(e) {
			return {error: e.stack};
		}
	}


	async pushArrayItem(path, data) {
		await this.ensureDir(path);

	}
	
	async log(prefix="info",text="Nothing to write!") {
		var pth = `~/logs/${prefix}/BH_${Date.now()}`
		try {
			await this.ensureDir(pth, isDir);
			await fs.writeFile(
				pth,
				text
			); 
		} catch(e) {
			console.log(e)
		}
	}

	removeDirectory(dirPath) {
	  return new Promise((resolve, reject) => {
		//  console.log("WOW")
		
		  
	    fsRegular.rm(dirPath, { recursive: true }, (err) => {
	      if (err) {
	        reject(err);
	      } else {
	        resolve();
	      }
	    });
	  });
	}

	async writeAsBinaryFormat(
		rPath,
		r,
		opts = {}
	) {
		
		/**
		 * writes a FILE of binary with .awtsmoosJSON extension
		 * at given path (FILE not a folder)
		 */
		try {
			if(typeof(rPath) != "string" || !rPath)
				return {
					error: {
						message: "Make sure path is valid",
						code: "INVALID_PATH"
					}
				};
			if(typeof(r) != "object" || !r) {
				return {
					error: {
						message: "Only enter an object for serialization",
						code: "ONLY_OBJ_OR_ARRAY"
					}
				};
			}
			
			var awtsJson = null;


			//automaitcally checks if its an array
			awtsJson = awtsmoosBinary.serializeJSON(r);
			
			var myPath = await this.ensureAwtsmoosBinaryPath(rPath);
			
			var wrote = await fs.writeFile(myPath, awtsJson);
		} catch(e) {
			console.log(e);
			return {
				error: e.stack,
				rPath
			}
		}
		return {
			success: {
				wrote,
				joined,
				rPath
			}
		};
			
	}

	async parseBinaryData({
		path, 
		properties
	}) {
		try {
			if(!properties) {
				var data = await fs.readFile(path);
				if(await awtsmoosBinary.isAwtsmoosObject(data)) {
					return await awtsmoosBinary.deserializeBinary(data);
				} else return null;
			} else {
				if(typeof(properties) == "string") {
					try {
						properties = JSON.parse(properties);
					} catch(e){

					}
				}
				if(await awtsmoosBinary.isAwtsmoosObject(path)) {

					var mapt = await awtsmoosBinary.mapBinary(path, properties);
					
					return mapt;
				} else {
					return null
				}
			}
		} catch(e) {
			console.log("Issue reading",e);
			return {
				error: e
			}
			return null;
		}
	}

	async getDynamicBinaryRecord({
			filePath,
			properties,
			isFile=false,
			stat,
			derech,
			maxOrech,
			shouldNullify = false,
			meta = false
		}) {
		//	properties = false;
		try {
			var joined = null;
			if(!isFile) {
				try {
					joined = path.join(filePath, "_awts.awtsmoosJSON")

					await fs.access(joined);
				} catch(e) {
					return null;
				}
			} else {
				try {
					joined =  await this.ensureAwtsmoosBinaryPath(rPath, false);
					
					await fs.access(joined);
				} catch(e) {
					return null
				}
			}
			var p = parseBinaryData({
				path: joined,
				properties
			});
			if(p.success) {
				return p
			} else if(p.error) {
				throw new Error (p.error);
			}
		} catch(e) {
			
			console.log("BINARY error",filePath,properties,e)
			return {
				error: e.stack,
				somethingWentNotOpenlyGOodYet:true
			};
		}
		return null
	}

	
	/**
	 * Create a new record.
	 * @param {string} id - The identifier for the new record.
	 * @param {object} record - The data for the new record.
	 * @returns {Promise<void>} - A Promise that resolves when the record has been created.
	 *
	 * @example
	 * await db.create('user1', { name: 'John Doe', age: 30 });
	 */
	async create /*or update!*/(id, record) {
		/*var existing = await this.get(id);
		if (existing !== null) {
		    throw new Error(`Record with id "${id}" already exists.`);
		}*/
		await this.write(id, record);
	}
	/**
	 * Update a record.
	 * @param {string} id - The identifier for the record.
	 * @param {object} record - The updated data for the record.
	 * @returns {Promise<void>} - A Promise that resolves when the record has been updated.
	 *
	 * @example
	 * await db.update('user1', { age: 31 });
	 */
	async update(id, record) {
		var existing = await this.get(id);
		if(existing === null) {
			throw new Error(`Record with id "${id}" does not exist.`);
		}
		await this.write(id, { ...existing, ...record });
	}
	/**
	 * Get the path for a file to be deleted.
	 * @param {string} id - The identifier for the file.
	 * @returns {string} - The full path to the file.
	 *
	 * @example
	 * var filePath = await db.getDeleteFilePath('user1');
	 */
	async getDeleteFilePath(id, isRegularDir) {
		//console.log("OK",isRegularDir,id)
		var completePath = await this.getAwtsmoosFilePath(id, isRegularDir);
		return completePath;
		var stat;
		try {
			stat = await fs.stat(completePath);
		} catch (e) {}
		var isDir = stat.isDirectory();
		var isFileOrDynamicDir = false;
		if(stat) {
			// If it's a directory, don't append .json
			//	console.log("Still trying")

			//	console.log("Is it?",checkIfItsSingleEntry)
			return completePath;
		} else {
			//check for json extension
			var j = completePath + ".json";
			try {
				await fs.stat(j)
				return j
			} catch (e) {
				return null;
			}
		}
		

	}
	/**
	 * Delete a file or a directory.
	 * @param {string} id - The identifier for the file or directory.
	 * @returns {Promise<void>} - A Promise that resolves when the file or directory has been deleted.
	 *
	 * @example
	 * await db.delete('user1');
	 */
	async delete(id, isRegularDir = false) {
		var filePath = await this.getDeleteFilePath(id, isRegularDir);
		// console.log("Hi there",id,filePath);
		try {
			var stat = await fs.stat(filePath);
			// Remove the file or directory
			if(stat.isFile()) {
				await fs.unlink(filePath);
			} else if(stat.isDirectory()) {
				await fs.rm(filePath, { recursive: true });
			}
			return {
				success: {
					message: "Deleted it",
					path: filePath,
					id
				}
			};
		} catch (error) {
			return {
				error: {
					message: "There was an error",
					stack: error.stack
				}
			}
			if(error.code !== 'ENOENT') throw error;
			return false;
			// If the file or directory does not exist, we do nothing
		}
	}
	/**
	 * Get information about a file or directory.
	 * @param {string} path - The path to the file or directory.
	 * @param {string} order - The order of the results ('asc' or 'desc').
	 * @returns {Promise<Array<string>>} - A Promise that resolves with the requested information.
	 */
	async info(path, order = 'asc') {
		var stats = await stat(path);
		if(stats.isDirectory()) {
			var files = await readdir(path);
			files.sort();
			if(order === 'desc') {
				files.reverse();
			}
			return files.slice(0, 10);
		} else if(stats.isFile()) {
			var parts = path.split('/');
			parts.pop(); // remove the file name
			if(order === 'desc') {
				parts.reverse();
			}
			return parts;
		}
	}
	/**
	 * Recursive method to read all files from a directory and return an array of { path, data } objects.
	 * @param {string} dir - The directory to read from.
	 * @returns {Promise<Array<{ path: string, data: Buffer }>>}
	 */
	async readAllFiles(dir) {
		let results = [];
		var list = await fs.readdir(dir);
		for(let file of list) {
			file = path.resolve(dir, file);
			var stat = await fs.stat(file);
			if(stat && stat.isDirectory()) {
				results = results.concat(await this.readAllFiles(file));
			} else {
				results.push({
					path: file,
					data: await fs.readFile(file),
				});
			}
		}
		return results;
	}
	/**
	 * Exports the database to a binary file.
	 * @returns {Promise<void>}
	 */
	async exportDatabase() {
		var allFiles = await this.readAllFiles(this.directory);
		var fileData = Buffer.from(JSON.stringify(allFiles));
		await fs.writeFile(path.join(this.directory, 'db_export.bin'), fileData);
	}
	/**
	 * Imports the database from a binary file.
	 * @returns {Promise<void>}
	 */
	async importDatabase() {
		var fileData = await fs.readFile(path.join(this.directory, 'db_export.bin'));
		var allFiles = JSON.parse(fileData.toString());
		for(let file of allFiles) {
			await this.ensureDir(file.path);
			await fs.writeFile(file.path, file.data);
		}
	}
}
module.exports = DosDB;
