//B"H
var AwtsmoosFS = require("./awtsmoosFs/index.js")
var fs = null;
var awtsmoosBinary = require ("./awtsmoosBinary/awtsmoosBinaryJSON.js")
var path = require('path');

var gde = require("./getDirectoryEntries.js")
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
	constructor(directory) {
		this.directory = directory || "../";
		/*this.indexManager = new AwtsmoosIndexManager({
			directory,
			db: this
		});*/
	}
	/**
	 * Initialize the database by creating the root directory, if it does not already exist.
	 * This method is called automatically when a new DosDB is created.
	 * @returns {Promise<void>} - A Promise that resolves when the directory has been created (or if it already exists).
	 */
	async init() {
        if(!fs) {
            fs = new AwtsmoosFS();
            var joined = path.join(this.directory, "/awtsmoosOs.awtsmoosFs")
            
            var fh = await fs.initialize(joined)
            console.log("INIT",fh)
            this.fileSystemDirectory = this.directory;
            this.directory = await this.getFilePath(this.directory);
        }
        //await fs.mkdir(this.directory, { recursive: true });
		try {
			//await this.indexManager.init(this, 777);
		} catch (e) {
			console.log(e, "Index issue")
		}
	}

    sanitizePath(path,overrideSanity=false) {
        // The essence of purity, the path untangled and unbroken
        if(!overrideSanity)
			while (path.includes('..')) {
				// Replacing the twisted trails with the righteous root
				path = path.replace('..', '');
			}
        path = path.split("/").filter(r=>r).join("/");
            if(!path) path="/"
        return path  // Returning the sanctified path, a path of light
    }
	/**
	 * Get the path for a record file.
	 * @param {string} id - The identifier for the record.
	 * @returns {string} - The full path to the file where the record will be stored.
	 *
	 * @example
	 * var filePath = await db.getFilePath('user1');
	 */
	async getFilePath(id, isDir = false) {
		if(typeof(id) != "string")
			return id;
		id = this.sanitizePath(id);
        
		// Remove mainDir from id if it is present, otherwise leave id as is
		var cleanedPath =id;
		var fullPath = cleanedPath// path.join(this.directory, cleanedPath);
		
        fullPath = fullPath.replaceAll("\\", "/")
		// Check if id already contains an extension
		if(path.extname(id) || isDir) {
			// If it does, use the id as is
			return fullPath;
		}
		// Try to get the status of the file/directory
		try {
			await fs.stat(fullPath);
			// If it's a directory or file, return the path as is
			return fullPath;
		} catch (error) {
			return fullPath;
		}
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
		var myPath = await this.getFilePath(filePath);
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
		keepJSON:false
	}) {
		var keepJSON = options.keepJSON
		try {
			if(!options || typeof(options) != "object") {
				options = {};
			}
		
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
			let filePath = await this.getFilePath(id);
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
						checkIfItsSingleEntry = await this.getDynamicRecord(ob);
						if(checkIfItsSingleEntry._awtsmoosDeletify) {
							return undefined;
						}
				//		console.log("GOT?", checkIfItsSingleEntry, filePath);
					} catch (e) {
					//	console.log("Prob", e);
					}
					if(checkIfItsSingleEntry || checkIfItsSingleEntry === undefined) {
						return checkIfItsSingleEntry;
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
								
								allContents[fileName] = res;
							}
						}
						for(var dirName in fileIndexes.subdirectories) {
							var res = await this.get(path.join(id, dirName), options);
							if(res !== null) {
								
								allContents[dirName] = res;
							}
						}
						return allContents;
					} else {
						// If filesAndFoldersDifferent is true, append ".folder" to directories
						var info = (fileIndexes || []).map(this.mapResults).map((fileName) => {
							// Check if it's a directory based on statObj
							
							
							return fileName;
						});
						return info;
					}
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
					return res;
				} else {
					var content = await fs.readFile(filePath);
					return content.toString(); // Assuming you want to convert binary data to string
				}
			} catch (error) {
				if(error.code !== 'ENOENT'){}
					//console.error(error);
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
        if(typeof(filePath) != "string") {
            return console.log("NO PATH",filePath)
        }
		var dirPath = !isDir ? path.dirname(filePath) : filePath;
		console.log("ENSURING directory exists",dirPath)
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
		var filePath = await this.getFilePath(id, isDir);
		await this.ensureDir(filePath, isDir);
		if(isDir) {
			return;
		}
		// Determine the directory path
        if(typeof(filePath) != "string") {
            console.log("WHAT",filePath,id)
            return null
        }
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
				return await this.writeRecordDynamic(filePath, record, opts)
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
			//return {error: e};
		}
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
			//console.log(e)
		}
	}

	removeDirectory(dirPath) {
	  return new Promise(async (resolve, reject) => {
		//  console.log("WOW")
		
		  
	    await fs.rm(dirPath);
	  });
	}
	/**
	 * @description goes through each
	 * key and writes it as a 
	 * folder with the value as a value
	 * file in it 
	 * with different file extension
	 * based on type string, number, bin etc.)
	 * 
	 * for nseted object repeats
	 * 
	 * also makes metadta file for retrieval
	 * @param {string full path} rPath 
	 * @param {JavaScript object} r 
	 */
	async writeRecordDynamic(rPath, r, opts={}) {
		if(typeof(rPath) != "string" || !rPath)
			return false;
		if(typeof(r) != "object" || !r) {
			return false
		}
		var isArray = Array.isArray(r);
		var keys = Array.from(Object.keys(r));
		var originalKeys = keys;
		if(isArray) {
			keys = keys.concat("length")
		}
		var awtsJson = awtsmoosBinary.serializeJSON(r);
        var joined = path.join(rPath, "_awts.awtsmoosJSON");
        await this.ensureDir(joined);
        console.log("WRiting!!! !! !!! !!",joined,r)
        try {
            var wrote = await fs.writeFile(joined, awtsJson);
        } catch(e) {
            console.log(e);
        }
        return wrote;
	}
	
    
	
	/**
	 * @description returns a JSON object
	 * with mapped proeprties based
	 * on input from @method writeRecordDynamic
	 * @param {string} dynPath 
	 * the dynamic full path to single "record".
	 * this should be the directory that
	 * has the _awtsmoos.meta.json file in it
	 * @private record should be called with this.get
	 * not directly
	 */
	async getDynamicRecord({
		filePath,
		properties,
		stat,
		derech,
		maxOrech,
		shouldNullify = false,
		meta = false
	}) {
		try {
            var joined = path.join(filePath, "_awts.awtsmoosJSON")
            var data = await fs.readFile(joined);
            if(awtsmoosBinary.isAwtsmoosObject(data)) {
                return awtsmoosBinary.deserializeBinary(data);
            }
        } catch(e) {
            return null;
        }
		return null
	}
	/**
	 * 
	 * @param {string} filePath 
	 * path to the directory to check
	 * 
	 * assuming u already called
	 * fs.stat on the directory 
	 * path to determine if 
	 * its a directory.
	 * @returns metadata
	 * JAvaScript object
	 * containg 
	 * the properties 
	 * of the "json" 
	 * and relative paths
	 * to find the values
	 * along with indicator 
	 * of the type
	 * of json
	 */
	async IsDirectoryDynamic(
		filePath
	) {
		var metaPath = path.join(
			filePath,
			"_awtsmoos.meta.entry.json"
		);
		var hasM = null;
		try {
			hasM = await fs.readFile(
				metaPath
			);
		} catch (e) {}
		if(!hasM) return null;
		var js = null;
		try {
			js = JSON.parse(hasM)
		} catch (e) {
			return null;
		}
		if(
			!js.entries ||
			typeof(js.entries) !=
			"object"
		) {
			return null;
		}
		return js;
	}
	mapResults(w, propertyMap, mapToOne = true) {
		var p = propertyMap;
		if(!Array.isArray(propertyMap))
			return w;
		if(
			!p.length ||
			propertyMap.includes("entityId")
		) return w;
		var ent = Object.entries(w)
		var fe = Object.fromEntries(
			ent.filter(q => {
				return propertyMap.includes(q[0])
			})
		)
		if(mapToOne) {
			fe = Object.values(fe)[0]
		}
		return fe
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
		var completePath = await this.getFilePath(id, isRegularDir);
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
			/*
  var checkIfItsSingleEntry = 
		await this.getDynamicRecord({
			completePath,
			stat
		});

  */
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
		/*else {
		isFileOrDynamicDir = true;
	}
	
	if(isFileOrDynamicDir) {
		var newPath =  completePath 
        stat = await fs.stat(newPath);

        if(stat && stat.isFile()|| stat.isDirectory()) {
            return newPath;
        }
	}

 */
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
