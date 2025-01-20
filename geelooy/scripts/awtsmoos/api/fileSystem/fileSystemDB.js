//B"H

class APIHandler {
    basePath = "/api/social/"
    constructor(context=null) {
      if(context) {
        this.context = context;
      }
      this.baseUrl = location.origin+ this.basePath;
    }
  
    async init(name) {
      this.dbName = name;
    }
  
    // Helper function to get the current alias
    getCurrentAlias() {
      var context = null;
      try {
        context = window 
      } catch(e) {
        context = this.context
      }
      if (!context.curAlias) {
        alert("You are not logged in. Please log in to continue.");
        throw new Error("User not logged in.");
      }
      return context.curAlias;
    }
  
    // Helper function to handle API responses
    async handleResponse(response) {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
      return response.json();
    }
  
    // Create or update data on the API (makeFile)
    async makeFile(storeName, key, value) {
      const aliasId = this.getCurrentAlias();
      const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/makeFile`);
      const params = new URLSearchParams({
        path: `${storeName}/${key}`,
        value: value // Pass the value as a query string
      });
  
      try {
        const response = await fetch(url, {
          method: 'POST',  // POST for creating or updating the file
          body: params
        });
  
        await this.handleResponse(response);
        console.log("File created successfully");
      } catch (error) {
        console.error("Error creating file:", error);
        throw error;
      }
    }
  
    // Read data from the API (readFile)
    async readFile(storeName, key) {
      const aliasId = this.getCurrentAlias();
      const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/readFile`);
      url.search = new URLSearchParams({
        path: `${storeName}/${key}`
      }).toString(); // Set the search/query parameters for GET request
  
      try {
        const response = await fetch(url, {
          method: 'GET',  // GET for reading the file
        });
        return response.text();
      } catch (error) {
        console.error("Error reading file:", error);
        throw error;
      }
    }
  
    // Get all data from a store (readFolder)
    async readFolder(storeName) {
      const aliasId = this.getCurrentAlias();
      const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/readFolder`);
      url.search = new URLSearchParams({
        path: storeName
      }).toString(); // Set the search/query parameters for GET request
  
      try {
        const response = await fetch(url, {
          method: 'GET',  // GET for fetching folder data
        });
        return await this.handleResponse(response);
      } catch (error) {
        console.error("Error fetching folder data:", error);
        throw error;
      }
    }
  
    // Create a folder (makeFolder)
    async makeFolder(storeName) {
      const aliasId = this.getCurrentAlias();
      const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/makeFolder`);
      const params = new URLSearchParams({
        path: storeName
      });
  
      try {
        const response = await fetch(url, {
          method: 'POST',  // POST for creating a folder
          body: params
        });
  
        await this.handleResponse(response);
        console.log("Folder created successfully");
      } catch (error) {
        console.error("Error creating folder:", error);
        throw error;
      }
    }
  
    async renameFolder(storeName, oldKey, newKey) {
       
    
        await this.makeFolder(storeName, newKey);
        await this.delete(storeName, oldKey);
    }
    // Rename a file (key) (as before)
    async renameFile(storeName, oldKey, newKey) {
      const value = await this.readFile(storeName, oldKey);
      if (!value) {
        throw new Error(`Key "${oldKey}" does not exist.`);
      }
  
      await this.makeFile(storeName, newKey, value);
      await this.delete(storeName, oldKey);
      console.log(`Renamed key "${oldKey}" to "${newKey}".`);
    }
  
    
    // Delete a key from a store (deleteFile)
    async deleteFile(storeName, key) {
      const aliasId = this.getCurrentAlias();
      const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/delete`);
      const params = new URLSearchParams({
        path: `${storeName}/${key}`
      });
  
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          body: params // Send params in the body
        });
  
        await this.handleResponse(response);
        console.log(`Key "${key}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting key:", error);
        throw error;
      }
    }
 
    async getAllKeys(storeName) {
        return await this.readFolder(storeName);
    }

    async getAllStoreNames() {
        return await this.readFolder("");
    }
  
    // Delete a key from a store (general delete)
    async delete(storeName, key) {
      const aliasId = this.getCurrentAlias();
      const url = new URL(`${this.baseUrl}aliases/${aliasId}/fileSystem/delete`);
      const params = new URLSearchParams({
        path: `${storeName}/${key}`
      });
  
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          body: params // Send params in the body
        });
  
        await this.handleResponse(response);
        console.log(`Key "${key}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting key:", error);
        throw error;
      }
    }

    async write(st, key, val) {
        if(!val) {
            return await this.makeFolder(`${st}/${key}`)
        } else {
            return await this.makeFile(st, key, val)
        }
    }

    async read(st, key) {
        return await this.readFile(st, key);
    }
    async Koysayv(st, key, val) {
        return await this.write(st, key, val);
    }

    async Laynin(st, key) {
        return await this.read(st, key);
    }
  }
  
  export default APIHandler;
  