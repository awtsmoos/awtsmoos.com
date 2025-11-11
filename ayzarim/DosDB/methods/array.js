//B"H
/**
 * path methods for DosDB class
 */

var fs = require("fs").promises;

const awtsmoosJSON = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
module.exports = {

	async getArrayAtPath(rPath) {
		if(typeof rPath !== "string" || !rPath) {
			return {
				error: {
					message: "Make sure path is valid",
					code: "INVALID_PATH"
				}
			};
		}
		var myPath = null;
		try {
			myPath =  await this.ensureAwtsmoosBinaryPath(rPath);

			
			
			var p=await this.parseBinaryData({path: myPath});
			
		//	console.log(1111223,myPath,rPath,p)
			var s = p?.success;
			var inputArray = [];
			if(s) {
				if(!Array.isArray(s)) {
					s = Array.from(s);
				}
				inputArray =
				inputArray.concat(s);
				p = inputArray
			} else {
				inputArray = [];
				/*
				return ({
					BH: 'B"H',

					myPath,
					error: {
						message: "Array not found",
						code: "ARRAY_404",
						p,
						myPath
					}
				})*/
			}
			return {
				success: inputArray,
				myPath
			}
		} catch(e) {
			//console.log("PATHetic",rPath)
			return {
				error: e.stack,
				ok:"well",
				myPath
			}
		}
	},
	
	/**
B"H
	 * @function kavClarify
	 * @description Searches an array, clarifying object properties from exact values with the Awtsmoos’s light.
	 * @param {Array} arr - Array of mixed elements (objects, strings, numbers).
	 * @param {Object} cond - Condition object with 'property' for objects, 'exact' for standalone values.
	 * @param {Function} action - Action for matches.
	 * 
	 * @examples of schema:
	 * 
	 * var comments = [
			{ id: "comment123", text: "Hello" },
			"just a string",
			42,
			{ id: "comment456", text: "World" },
			{ value: "sneaky", id: "comment789" }
		];

		// Conditions to test
		var objCondition = { property: { id: { selfEquals: "comment123" } } };
		var stringCondition = { exact: { selfEquals: "just a string" } };
		var numberCondition = { exact: { selfEquals: 42 } };
		var complexCondition = {
			OR: [
				{ property: { id: { selfEquals: "comment789" } } },
				{ property: { value: { selfEquals: "sneaky" } } }
			]
		};
        kavClarify(comments, stringCondition, str => console.log("String",str));
        //etc
	 * @returns {void}
	 */
	kavClarify(arr, cond, action) {
		// Matches object properties recursively
		const matchProperties = (obj, condObj) => {
			// If condition has selfEquals, compare directly
			if (condObj.selfEquals !== undefined) {
				return obj === condObj.selfEquals;
			}
			// If obj isn’t an object or is null, it can’t match nested properties
			if (typeof obj !== "object" || obj === null) return false;
			// Check all keys in condObj
			return Object.keys(condObj).every(key => {
				if (obj[key] === undefined) return false;
				return matchProperties(obj[key], condObj[key]);
			});
		};
	
		// Matches exact values (primitives)
		const matchExact = (item, condObj) => {
			return item === condObj.selfEquals;
		};
	
		// Evaluates the condition tree
		const evaluateCondition = (item, condObj) => {
			if (typeof condObj !== "object" || condObj === null) return false;
			if (condObj.AND) return condObj
				.AND.every(subCond => evaluateCondition(item, subCond));
				
			if (condObj.OR) return condObj
				.OR.some(subCond => evaluateCondition(item, subCond));

			if (condObj.property) return matchProperties(item, condObj.property);
			if (condObj.exact) return matchExact(item, condObj.exact);
			return false;
		};
	
		arr.forEach((item, i, arr) => {
			if (evaluateCondition(item, cond)) {
				action(item, i, arr);
			}
		});
	},

	async findInArray(rPath, conditionsObject) {
		if(!conditionsObject || typeof(conditionsObject) != "object") {
			return {
				error: {
					message: "Need to supply object of properties",
					code: "NO_PROP",
					tried: conditionsObject,
					path: rPath,
					method:"find in"
				}
			}
		}
		var ar = await this.getArrayAtPath(rPath);
		if(ar?.error) return ar;
		var myPath;
		var inputArray = ar?.success;
		myPath = ar.myPath;
		if(!Array.isArray(inputArray) || typeof(myPath) != "string") {
			return {
				error: {
					message: "Couldn't find array at path",
					path: rPath,
					myPath
				}
			}
		}

		var found = null;
		this.kavClarify(inputArray, conditionsObject, (w, i, arr) => {
			found = w;

		});
		if(!found) {
			return {
				error: {
					message: "Couldn't find, conditions didn't match",
					inputArray,
					conditionsObject,
					originalPath: rPath,
					modifiedPath: myPath,
					code: "NO_CONDITIONS"
				}
			}
		}
		return {
			success: found
		}

	},
	async removeElementFromArray(rPath, conditionsObject, opts = {}) {
		if(!conditionsObject || typeof(conditionsObject) != "object") {
			return {
				error: {
					message: "Need to supply object of properties",
					code: "NO_PROP",
					path: rPath,
					tried: conditionsObject
				}
			}
		}

		if(typeof(opts) != "object" || !opts) {
			opts = {}
		}
		
		var ar = await this.getArrayAtPath(rPath);
		if(ar?.error) return ar;
		var myPath;
		var inputArray = ar?.success;
		myPath = ar.myPath;
		if(!Array.isArray(inputArray) || typeof(myPath) != "string") {
		
			return {
				error: {
					message: "Couldn't find array at path",
					path: rPath,
					myPath,
					details: ar
				}
			}
		}
		var indexToDelete = -1;
		this.kavClarify(inputArray, conditionsObject, (w, i, arr) => {
			indexToDelete = i;
		});
		if(indexToDelete < 0) {
			
			
			return {
				error: {
					message: "Couldn't delete, conditions didn't match",
					inputArray,
					conditionsObject,
					code: "NO_CONDITIONS",
					originalPath: rPath,
					modifiedPath: myPath
				}
			}
		}
		var isEmpty = false;
		try {
			var cut = inputArray.splice(indexToDelete, 1);
			if(inputArray.length == 0) {
				isEmpty = true;
				
			}
			if(
				isEmpty && 
				opts?.deleteSelfIfEmpty
					
				
			) {
				var del = await this.delete(myPath);
				if(del.error) {
					return {
						error: {
							message: "Issue in deleting self when empty",
							code: "NO_DEL_WHEN_EMPTY",
							details: del.error
						}
					}
				}
				return {
					success: {
						inputArray,
						deleted: del,
						isEmpty: true,
						elementsRemoved: cut
					}
				}
			}
			var ser = awtsmoosJSON.serializeJSON(inputArray);
			var wr = await fs.writeFile(myPath, ser)
			return {
				success: {
					written: wr,
					serialized: ser.length,
					inputArray,
					elementsRemoved: cut
				}
			}
			
		} catch(e) {
			return {
				error: {
					message: "Couldn't splice",
					code: "NO_SPLICE",
					details: e
				}
			}
		}


	},
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
			var array = []
			try {
				array = await this.getArrayAtPath(rPath);
			
				if(array.error) {
					inputArray = [];
					myPath = await this.ensureAwtsmoosBinaryPath(rPath);
				}
				
				if(array.success) {
					inputArray = array.success;
					myPath = array.myPath;
				}
			} catch(e) {
				inputArray = [];
				myPath = await this.ensureAwtsmoosBinaryPath(rPath);
				console.log("ISSUE with getting array",e)
				return {
					error: "Acutal problem",
					stack:e.stack
				}
			}

			if(!inputArray) inputArray = [];
			
			if(!myPath) {
				return {
					error: "Coudn't find proper path",
					myPath,
					rPath
				}
			}
			if(inputArray.includes(key)) return {
				success: {
					alreadyThere: key
				}
			}
			inputArray.push(key);
			var ser = awtsmoosJSON.serializeJSON(inputArray);
	
		
			var wr = await fs.writeFile(myPath, ser)

			var des = await awtsmoosJSON.deserializeBinary(myPath)
			return {
				success: {
					written: myPath,
					serialized: ser.length,
					inputArray
				}
			}
		} catch(e) {
			return {
				error: e.stack,
				what: "is"
			}
		}
	},

	async arrayAppend(rPath, value, opts={}) {
		try {
			var inputArray  = null;
			var myPath = null;
			var array = await this.getArrayAtPath(rPath);
			
			if(array.error && array.error.code !== "ARRAY_404") {
                return array;
            }

			if(array.success) {
				inputArray = array.success;
				myPath = array.myPath;
			} else {
                inputArray = [];
                myPath = await this.ensureAwtsmoosBinaryPath(rPath);
            }

			if(!Array.isArray(inputArray) || !myPath) {
				return {
					error: {
						message: "Something's wrong with getting array or path",
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
				error: e.stack
			}
		}
	}
}