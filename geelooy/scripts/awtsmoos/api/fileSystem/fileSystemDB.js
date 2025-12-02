//B"H

class APIHandler {
	basePath = "/api/social/"
	constructor(context = null) {
		if (context) {
			this.context = context;
		}
		this.baseUrl = location
			.origin + this.basePath;
	}

	async init(name) {
		this.dbName = name;
	}
	
	async rename(oldPath, newPath) {
	        const aliasId = this.getCurrentAlias();
	        const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/renameFolder`);
	        
	        // The server expects 'path' (old) and 'newPath'
	        const params = new URLSearchParams({
	            path: oldPath,
	            newPath: newPath
	        });
	
	        try {
	            const response = await fetch(url, {
	                method: 'POST',
	                body: params
	            });
	            await this.handleResponse(response);
	            return true;
	        } catch (error) {
	            console.error("Rename failed:", error);
	            throw error;
	        }
	    }
	
	    // ---MOVE METHOD (Cut/Paste) ---
	    async move(oldPath, newPath) {
	        const aliasId = this.getCurrentAlias();
	        const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/moveEntry`);
	        
	        const params = new URLSearchParams({
	            oldPath: oldPath,
	            newPath: newPath
	        });
	
	        try {
	            const response = await fetch(url, {
	                method: 'POST',
	                body: params
	            });
	            await this.handleResponse(response);
	            return true;
	        } catch (error) {
	            console.error("Move failed:", error);
	            throw error;
	        }
	    }

	// Helper function to get the current alias
	getCurrentAlias() {
		var context = null;
		try {
			context = window
		} catch (e) {
			context = this.context
		}
		if (!context.curAlias) {
			alert(
				"You are not logged in. Please log in to continue.");
			throw new Error(
				"User not logged in."
				);
		}
		return context.curAlias;
	}

	// Helper function to handle API responses
	async handleResponse(response) {
		if (!response.ok) {
			const error =
				await response
				.json();
			throw new Error(error
				.message ||
				"Something went wrong"
				);
		}
		return response.json();
	}
	
	


	async makeFile({$i}) {
	    try {
	        var {
	            aliasId, 
	            path, 
	            content,
	            binaryData
	        } = $i.$_POST;
	        
	        if(content === undefined || content === null) {
	            content = $i.$_POST.value;
	        }
	        if(binaryData) {
	            content = binaryData.data;
	        }
	      
	        if (content === undefined || content === null)
	            return er({ message: "Content/value parameter missing", code: "CONTENT_MISSING" });
	            
	        // Ensure the 'path' exists in POST or GET
	        if (!path) {
	            path = $i.$_GET.path;
	        }
	        if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });
	
	        var userid = $i?.request?.user?.info?.userId;
	        if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });
	    
	        var isAuthorized = await verifyAlias({$i, aliasId, userid });
	        if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });
	
	        var currentSize = await checkAliasSize({$i, aliasId});
	        
	        var newFileSize
	        var strContent = content;
	        if(Buffer.isBuffer(content)) {
	            newFileSize == content.length;
	        } else if(typeof(content) == "object") {
	            try {
	                strContent = JSON.stringify(content);
	            } catch(e){}
	        }
	        try {
	            newFileSize = Buffer.byteLength(strContent, 'utf8');
	            if (currentSize + newFileSize > 10 * 1024 * 1024) {
	                return er({ message: "File size limit exceeded", code: "FILE_SIZE_LIMIT" });
	            }
	        } catch(e) {
	            return er({
	                message: "Issue saving file",
	                details: e.stack
	            })
	        }
	        
	        // Write the file to the alias's file system
	        try {
	            var filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
	            var wr = await $i.db.write(filePath, content);
	
	        } catch(e) {
	            return er({
	                message: "Couldn't write",
	                details: e
	            })
	        }
	        return { success: {
	            filePath,
	            path,
	            aliasId,
	            userid,
	            wr
	        } };
	    } catch(e) {
	        return er({ message: "System Error", code: "SYSTEM", details:e.stack });
	    }
	}

	// Read data from the API (readFile)
	async readFile(storeName, key) {
		const aliasId = this
			.getCurrentAlias();
		const url = new URL(
			`${this.baseUrl}aliases/${aliasId}/fileSystem/readFile`
			);
		url.search =
			new URLSearchParams({
				path: `${storeName}/${key}`
			})
			.toString(); // Set the search/query parameters for GET request

		try {
			const response =
				await fetch(url, {
					method: 'GET', // GET for reading the file
				});
			var ct  =response.headers.get("content-type")
			console.log("H",ct)
			if(ct.includes("image")) {
				return response.blob()
			}
			return response.text();
		} catch (error) {
			console.error(
				"Error reading file:",
				error);
			throw error;
		}
	}

	// Get all data from a store (readFolder)
	async readFolder(storeName) {
		const aliasId = this
			.getCurrentAlias();
		const url = new URL(
			`${this.baseUrl}aliases/${aliasId}/fileSystem/readFolder`
			);
		url.search =
			new URLSearchParams({
				path: storeName
			})
			.toString(); // Set the search/query parameters for GET request

		try {
			const response =
				await fetch(url, {
					method: 'GET', // GET for fetching folder data
				});
			return await this
				.handleResponse(
					response);
		} catch (error) {
			console.error(
				"Error fetching folder data:",
				error);
			throw error;
		}
	}

	// Create a folder (makeFolder)
	async makeFolder(storeName) {
		const aliasId = this
			.getCurrentAlias();
		const url = new URL(
			`${this.baseUrl}aliases/${aliasId}/fileSystem/makeFolder`
			);
		const params =
			new URLSearchParams({
				path: storeName
			});

		try {
			const response =
				await fetch(url, {
					method: 'POST', // POST for creating a folder
					body: params
				});

			await this
				.handleResponse(
					response);
			console.log(
				"Folder created successfully"
				);
		} catch (error) {
			console.error(
				"Error creating folder:",
				error);
			throw error;
		}
	}

	async renameFolder(storeName,
		oldKey, newKey) {


		await this.makeFolder(
			storeName, newKey);
		await this.delete(storeName,
			oldKey);
	}
	// Rename a file (key) (as before)
	async renameFile(storeName, oldKey,
		newKey) {
		const value = await this
			.readFile(storeName,
				oldKey);
		if (!value) {
			throw new Error(
				`Key "${oldKey}" does not exist.`
				);
		}

		await this.makeFile(
			storeName, newKey,
			value);
		await this.delete(storeName,
			oldKey);
		console.log(
			`Renamed key "${oldKey}" to "${newKey}".`
			);
	}


	// Delete a key from a store (deleteFile)
	async deleteFile(storeName, key) {
		const aliasId = this
			.getCurrentAlias();
		const url = new URL(
			`${this.baseUrl}aliases/${aliasId}/fileSystem/delete`
			);
		const params =
			new URLSearchParams({
				path: `${storeName}/${key}`
			});

		try {
			const response =
				await fetch(url, {
					method: 'DELETE',
					body: params // Send params in the body
				});

			await this
				.handleResponse(
					response);
			console.log(
				`Key "${key}" deleted successfully.`
				);
		} catch (error) {
			console.error(
				"Error deleting key:",
				error);
			throw error;
		}
	}

	async getAllKeys(storeName) {
		return await this
			.readFolder(storeName);
	}

	async getAllStoreNames() {
		return await this
			.readFolder("");
	}

	// Delete a key from a store (general delete)
	async delete(storeName, key) {
		const aliasId = this
			.getCurrentAlias();
		const url = new URL(
			`${this.baseUrl}aliases/${aliasId}/fileSystem/delete`
			);
		const params =
			new URLSearchParams({
				path: `${storeName}/${key}`
			});

		try {
			const response =
				await fetch(url, {
					method: 'DELETE',
					body: params // Send params in the body
				});

			await this
				.handleResponse(
					response);
			console.log(
				`Key "${key}" deleted successfully.`
				);
		} catch (error) {
			console.error(
				"Error deleting key:",
				error);
			throw error;
		}
	}


    async write(st, key, val, type = null) {
        // Explicitly check type first
        if (type === 'directory') {
            // It's a folder request
            return await this.makeFolder(`${st}/${key}`);
        } else if (type === 'file') {
            // It's a file request
            return await this.makeFile(st, key, val || "");
        }

        // Fallback legacy logic if no type provided
        if (val === null || val === undefined) {
            return await this.makeFolder(`${st}/${key}`);
        } else {
            return await this.makeFile(st, key, val);
        }
    }

    

	async read(st, key) {
		return await this.readFile(
			st, key);
	}
	async Koysayv(st, key, val, type = null) {
	        return await this.write(st, key, val, type);
	    }

	async Laynin(st, key) {
		return await this.read(st,
			key);
	}
}

export default APIHandler;