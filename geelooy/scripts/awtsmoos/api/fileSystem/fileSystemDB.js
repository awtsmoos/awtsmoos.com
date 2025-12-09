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
	        // B"H - We use the existing moveEntry vessel for renaming
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
	
	


	async makeFile(st, key, content) {
		const aliasId = this
			.getCurrentAlias();
		const url = new URL(
			`${this.baseUrl}aliases/${aliasId}/fileSystem/makeFile`
			);
		
		let body;
		// B"H - Check if content is binary
		const isBinary = content instanceof Blob || 
		                 content instanceof ArrayBuffer || 
		                 content instanceof Uint8Array || 
		                 content instanceof File;

		if (isBinary) {
		    const formData = new FormData();
		    formData.append('path', st + "/" + key);
		    
		    let blob = content;
		    if (content instanceof ArrayBuffer || content instanceof Uint8Array) {
		        blob = new Blob([content]);
		    }
		    
		    // The server expects 'binaryData' for file uploads
		    formData.append('binaryData', blob, key);
		    body = formData;
		} else {
		    body = new URLSearchParams({
				path: st + "/" + key,
				content
			});
		}

		try {
			const response =
				await fetch(url, {
					method: 'POST', // POST for creating a folder
					body: body
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
			
			var ct  = response.headers.get("content-type") || "";
		    
		    // B"H - Correctly identify binary vs text.
		    // If it's explicitly an image, zip, or pdf, OR if the filename ends in .zip, return Blob.
		    // This prevents text() from corrupting the binary data of zip files.
			if(ct.includes("image") || ct.includes("zip") || ct.includes("pdf") || key.toLowerCase().endsWith(".zip")) {
				return response.blob();
			}
			
			// Default to text for everything else (js, html, json, etc.)
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

	async renameFolder(storeName, oldKey, newKey) {
        // Construct the full paths relative to the current context
	        const oldPath = storeName ? `${storeName}/${oldKey}` : oldKey;
	        const newPath = storeName ? `${storeName}/${newKey}` : newKey;
        
		await this.rename(oldPath, newPath);
	}
	// Rename a file (key) (as before)
	async renameFile(storeName, oldKey,
		newKey) {
		// B"H - Optimized to use server-side rename if available, otherwise fallback
		try {
		    const oldPath = storeName ? `${storeName}/${oldKey}` : oldKey;
            const newPath = storeName ? `${storeName}/${newKey}` : newKey;
            await this.rename(oldPath, newPath);
            console.log(`Renamed key "${oldKey}" to "${newKey}".`);
            return;
		} catch(e) {
		    // Fallback logic
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
	}
	
	
	
    async copy(oldPath, newPath) {
        const aliasId = this.getCurrentAlias();
        const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/copyEntry`);
        
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
            console.error("Copy failed:", error);
            throw error;
        }
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