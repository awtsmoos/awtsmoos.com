//B"H
class APIHandler {
    constructor(baseUrl = "/api/social/") {
      this.baseUrl = baseUrl;
    }
  
    // Helper function to get the current alias
    getCurrentAlias() {
      if (!window.curAlias) {
        alert("You are not logged in. Please log in to continue.");
        throw new Error("User not logged in.");
      }
      return window.curAlias;
    }
  
    // Helper function to handle API responses
    async handleResponse(response) {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
      return response.json();
    }
  
    // Create or update data on the API
    async write(storeName, key, value) {
      const aliasId = this.getCurrentAlias();
      const url = `${this.baseUrl}aliases/${aliasId}/fileSystem/${storeName}/${key}`;
  
      try {
        const response = await fetch(url, {
          method: 'PUT',  // Using PUT to create or update the file
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value })
        });
  
        await this.handleResponse(response);
        console.log("Data written successfully");
      } catch (error) {
        console.error("Error writing data:", error);
        throw error;
      }
    }
  
    // Read data from the API
    async read(storeName, key) {
      const aliasId = this.getCurrentAlias();
      const url = `${this.baseUrl}aliases/${aliasId}/fileSystem/${storeName}/${key}`;
  
      try {
        const response = await fetch(url);
        return await this.handleResponse(response);
      } catch (error) {
        console.error("Error reading data:", error);
        throw error;
      }
    }
  
    // Get all data from a store
    async getAllData(storeName) {
      const aliasId = this.getCurrentAlias();
      const url = `${this.baseUrl}aliases/${aliasId}/fileSystem/${storeName}`;
  
      try {
        const response = await fetch(url);
        return await this.handleResponse(response);
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    }
  
    // Get all keys from a store
    async getAllKeys(storeName) {
      const data = await this.getAllData(storeName);
      return Object.keys(data);
    }
  
    // Rename a file (key)
    async renameFile(storeName, oldKey, newKey) {
      const value = await this.read(storeName, oldKey);
      if (!value) {
        throw new Error(`Key "${oldKey}" does not exist.`);
      }
  
      await this.write(storeName, newKey, value);
      await this.delete(storeName, oldKey);
      console.log(`Renamed key "${oldKey}" to "${newKey}".`);
    }
  
    // Delete a key from a store
    async delete(storeName, key) {
      const aliasId = this.getCurrentAlias();
      const url = `${this.baseUrl}aliases/${aliasId}/fileSystem/${storeName}/${key}`;
  
      try {
        const response = await fetch(url, {
          method: 'DELETE',
        });
  
        await this.handleResponse(response);
        console.log(`Key "${key}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting key:", error);
        throw error;
      }
    }
  
    // Ensure store exists (this would be a placeholder since stores are managed on the backend)
    async ensureStore(storeName) {
      // On the backend, the store will be created on the fly, no need to manually ensure it
      // Placeholder function
    }
  }
  
  export default APIHandler;
  