//B"H
//B"H
class IndexedDBHandler {
  constructor(dbName) {
    this.dbName = dbName;
    this.db = null;
  }

  async Koysayv(st, key, val) {
    return await this.write(st, key, val);
  }

  async Laynin(st, key) {
    return await this.read(st, key);
  }

  // Initialize the database
  async init() {
    if (this.db) return;

    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = (event) => {
        console.error("Error opening database:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log("Database created or upgraded");

        // Create object stores during the upgrade if needed
        if (!db.objectStoreNames.contains("default")) {
          const store = db.createObjectStore("default", { keyPath: "key" });
          console.log("Default store created");
        }
      };
    });
  }

  // Ensure a store exists
  async ensureStore(storeName) {
    if (this.db.objectStoreNames.contains(storeName)) return;

    this.db.close();
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.db.version + 1);

      request.onerror = (event) => {
        console.error("Error upgrading database:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(storeName, { keyPath: "key" });
        console.log(`Object store '${storeName}' created`);
      };
    });
  }

  // Write data to a store
  async write(storeName, key, value) {
    await this.ensureStore(storeName);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.put({ key, value });

      request.onerror = (event) => {
        console.error("Error writing data:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = () => {
        console.log("Data written successfully");
        resolve();
      };
    });
  }

  // Read data from a store by key
  async read(storeName, key) {
    await this.ensureStore(storeName);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      const request = store.get(key);

      request.onerror = (event) => {
        console.error("Error reading data:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(request.result ? request.result.value : null);
      };
    });
  }

  async getAllKeys(storeName) {
    const data = await this.getAllData(storeName);
    return data.map((w) => Object.keys(w)[0]);
  }

  // Get all store names from the database
  async getAllStoreNames() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database connection is not open."));
        return;
      }

      try {
        const storeNames = Array.from(this.db.objectStoreNames);
        resolve(storeNames);
      } catch (error) {
        console.error("Error retrieving store names:", error);
        reject(error);
      }
    });
  }
  
  // Get all keys and values from a store
  async getAllData(storeName) {
    await this.ensureStore(storeName);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      const results = [];
      const request = store.openCursor();

      request.onerror = (event) => {
        console.error("Error fetching data:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push({ [cursor.value.key]: cursor.value.value });
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  // Rename a file (key)
  async renameFile(storeName, oldKey, newKey) {
    await this.ensureStore(storeName);

    const value = await this.read(storeName, oldKey);
    if (!value) {
      throw new Error(`Key "${oldKey}" does not exist.`);
    }

    await this.write(storeName, newKey, value);
    await this.delete(storeName, oldKey);
    console.log(`Renamed key "${oldKey}" to "${newKey}".`);
  }

  async deleteFile(storeName, key) {
    await this.delete(storeName, key)
  }

  // Delete a key from a store
  async delete(storeName, key) {
    await this.ensureStore(storeName);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.delete(key);

      request.onerror = (event) => {
        console.error("Error deleting key:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = () => {
        console.log(`Key "${key}" deleted successfully.`);
        resolve();
      };
    });
  }
}

export default IndexedDBHandler;
