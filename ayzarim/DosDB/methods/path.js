//B"H
/**
 * path methods for DosDB class
 * This version uses a robust and secure method for path resolution, fixing the root directory bug.
 */

const path = require("path");
const fs = require("fs").promises;

const logs = false; // Flag to control debug logging

module.exports = {

    /**
     * @method getAwtsmoosFilePath
     * @description THE CORE FINDER LOGIC. Securely resolves a path ID against the main directory.
     *              It follows the priority: AS-IS > .awtsmoosJSON > .json.
     * @param {string} id - The identifier, filename, or relative path.
     * @param {boolean} [isDir=false] - If true, treats the path as a directory.
     * @returns {Promise<string>} - The resolved, absolute, and safe path.
     */
    // This is the definitive version of the function in /BH/awtsmoos.com/ayzarim/DosDB/methods/path.js
    async getAwtsmoosFilePath(id, isDir = false, automaticallyAddAwtsmoos = true) {
        if (typeof id !== 'string' || !id) {
            return id;
        }

        const mainDir = path.resolve(this.directory || process.cwd());
        let workingId;

        // --- Robust path resolution logic (This part is correct and remains) ---
        const candidateAbsolutePath = path.resolve('/', id);
        const relativeFromMainDir = path.relative(mainDir, candidateAbsolutePath);

        if (relativeFromMainDir.startsWith('..') || path.isAbsolute(relativeFromMainDir)) {
            workingId = id.replace(/^[/\\]+/, '');
        } else {
            workingId = relativeFromMainDir;
        }

        const resolvedPath = path.resolve(mainDir, workingId);

        const finalRelativeCheck = path.relative(mainDir, resolvedPath);
        if (finalRelativeCheck.startsWith('..') || path.isAbsolute(finalRelativeCheck)) {
            throw new Error(`Path traversal attempt detected: ${id}`);
        }

        // --- THE NEW, FINAL, INSANELY ROBUST PATH FINDING LOGIC ---

        // PRIORITY 0: If the caller explicitly says it's a directory, we're done.
        if (isDir) {
            return resolvedPath;
        }
        
    //    console.log("Reading",resolvedPath);
        
        // PRIORITY 1: DISCOVERY. Check if the path AS GIVEN exists as either a file OR a directory.
        try {
            const stat = await fs.stat(resolvedPath);
            // If it exists "as is", THAT is what the user is referring to.
            // This correctly handles both `image.png` and `my_folder` when isDir=false.
            if (stat.isFile() || stat.isDirectory()) {
                return resolvedPath;
            }
        } catch (e) {
            // This is the expected case when nothing exists at the path "as is".
            // We will now proceed to hunt for data file extensions.
            if (e.code !== 'ENOENT') {
                 // Log unexpected errors but continue the search.
                console.error(`DosDB: Unexpected error during initial stat for ${resolvedPath}:`, e);
            }
        }

        // PRIORITY 2: Hunt for data file extensions (ONLY if PRIORITY 1 failed).
        // This handles cases where you request a data record by ID, e.g., get("prateem").
        const awtsmoosJsonPath = `${resolvedPath}.awtsmoosJSON`;
        try {
            const stat = await fs.stat(awtsmoosJsonPath);
            if (stat.isFile()) {
                return awtsmoosJsonPath;
            }
        } catch {}

        // PRIORITY 3: Fallback check for .json.
        const jsonPath = `${resolvedPath}.json`;
        try {
            const stat = await fs.stat(jsonPath);
            if (stat.isFile()) {
                return jsonPath;
            }
        } catch {}

        // --- FINAL CASE: Nothing was found. This must be a WRITE/CREATE operation. ---
        // We now return the path that SHOULD be created.
        if (automaticallyAddAwtsmoos) {
            // Prevent the double-extension bug.
            if (path.extname(resolvedPath).match(/\.(awtsmoosjson|json)$/i)) {
                // The input was "file.awtsmoosJSON" but it didn't exist. Use this path for creation.
                return resolvedPath;
            } else {
                // The input was "file". Default to creating the .awtsmoosJSON version.
                return awtsmoosJsonPath;
            }
        } else {
            // The caller does not want automatic extension handling (e.g., for writing plain text files).
            return resolvedPath;
        }
    },


    /**
     * @method ensureAwtsmoosBinaryPath
     * @description Finds a path using the core finder logic, then ensures its parent directory exists.
     * @param {string} rPath - The raw path to find and ensure.
     * @param {boolean} [alsoActuallyMakeParentDirectory=true] - Whether to create the parent directory.
     * @returns {Promise<string>} - The resolved path.
     */
    async ensureAwtsmoosBinaryPath(rPath, alsoActuallyMakeParentDirectory = true) {
        if (logs) console.log(`\n[ENSURE_START] Ensuring path for: ${rPath}`);
        
        const resolvedPath = await this.getAwtsmoosFilePath(rPath);
        if (typeof resolvedPath !== 'string') {
             if (logs) console.error(`[ENSURE_FAIL] Path resolution returned non-string value for: ${rPath}`);
             throw new Error("Invalid path resolution.");
        }

        if (alsoActuallyMakeParentDirectory) {
            const parentDir = path.dirname(resolvedPath);
            if (logs) console.log(`[ENSURE_PARENT] Directory to create: ${parentDir}`);
            await this.ensureDir(parentDir);
            if (logs) console.log(`[ENSURE_SUCCESS] Parent directory ensured.`);
        }
        
        if (logs) console.log(`[ENSURE_END] Final resolved path: ${resolvedPath}`);
        return resolvedPath;
    },
    
    /**
     * @method getAwtsmoosParentPath
     * @description Ascends a path to its parent directory.
     * @param {string} currentPath - The path from which to get the parent.
     * @returns {Promise<string|null>} - The parent path, or null if at the root.
     */
    async getAwtsmoosParentPath(currentPath) {
        if (typeof currentPath !== 'string' || !currentPath) {
            if (logs) console.log("[PARENT_WARN] Invalid path provided for parent lookup.");
            return null;
        }
        try {
            const normalizedPath = path.normalize(currentPath);
            const parentPath = path.dirname(normalizedPath);
            
            if (parentPath === normalizedPath || parentPath === ".") {
                if (logs) console.log(`[PARENT_TRACE] Path ${currentPath} is at the root, returning null.`);
                return null;
            }
            if (logs) console.log(`[PARENT_TRACE] Parent of ${currentPath} is ${parentPath}`);
            return parentPath;
        } catch (err) {
            if (logs) console.error("Error getting parent path:", err);
            return null;
        }
    },

    sanitizeAwtsmoosPath(rawPath) {
        return rawPath; 
    },

    /**
     * @method access
     * @description Checks for a path's existence and returns its stats.
     * @param {string} filePath - The path to verify.
     * @param {boolean} isDir - Whether to check for a directory.
     * @returns {Promise<object|null>} - Stat object if it exists, null otherwise.
     */
    async access(filePath, isDir = false) {
        try {
            const myPath = await this.getAwtsmoosFilePath(filePath, isDir);
            if (typeof myPath !== 'string' || !myPath) return null; 
            
            await fs.access(myPath); 
            const stat = await fs.stat(myPath);
            stat.awtsmoosPath = myPath;
            if (logs) console.log(`[ACCESS_SUCCESS] File/Directory exists at: ${myPath}`);
            return stat;
        } catch (e) {
            if (logs && e.code !== 'ENOENT') console.error(`[ACCESS_FAIL] Error accessing ${filePath}:`, e.message);
            return null;
        }
    },
    
    stat(filePath, isDir) {
        return this.access(filePath, isDir);
    },

    /**
     * @method removeJSONExtension
     * @description Strips .json or .awtsmoosJSON from a file path.
     * @param {string} filePath - The path to purify.
     * @returns {string} - The path without the extension.
     */
    removeJSONExtension(filePath) {
        if (typeof filePath !== 'string') return filePath;
        const extension = path.extname(filePath);
        if (extension === ".json" || extension === ".awtsmoosJSON") {
            if (logs) console.log(`[EXT_STRIP] Stripping ${extension} from ${filePath}`);
            return filePath.substring(0, filePath.length - extension.length);
        }
        return filePath;
    },

    /**
     * @method ensureDir
     * @description Creates a directory if it doesn’t exist.
     *              If isDir=false, it ensures the PARENT directory of the file path exists.
     * @param {string} targetPath - The directory path OR file path to ensure.
     * @param {boolean} [isDir=true] - If true, treats targetPath as a directory. If false, treats it as a file path.
     * @returns {Promise<string|undefined>} - The path of the directory that was ensured, or undefined on invalid input.
     */
    async ensureDir(targetPath, isDir = true) {
        if (typeof targetPath !== "string" || !targetPath) {
             if (logs) console.log(`[ENSURE_WARN] Invalid path provided to ensureDir: ${targetPath}`);
             return;
        }

        let directoryToEnsure;

        if (isDir) {
            directoryToEnsure = targetPath;
        } else {
            directoryToEnsure = path.dirname(targetPath);
        }
        
        if (logs) console.log(`[ENSURE_EXEC] Attempting to create directory recursively: ${directoryToEnsure}`);
        
        try {
            await fs.mkdir(directoryToEnsure, { recursive: true });
            if (logs) console.log(`[ENSURE_OK] Directory structure created/verified: ${directoryToEnsure}`);
            return directoryToEnsure;
        } catch (err) {
             if (logs) console.error(`[ENSURE_FAIL] Failed to create directory ${directoryToEnsure}:`, err.stack);
             throw err; 
        }
    },

    /**
     * @method getDeleteFilePath
     * @description Resolves the absolute path for a file/directory to be deleted.
     * @param {string} id - The identifier to resolve.
     * @param {boolean} isRegularDir - Whether it’s a directory.
     * @returns {Promise<string|null>} - The absolute path to delete, or null if path resolution fails security check.
     */
    async getDeleteFilePath(id, isRegularDir) {
        try {
            const resolved = await this.getAwtsmoosFilePath(id, isRegularDir);
            if (typeof resolved !== 'string' || !resolved) {
                if (logs) console.log(`[DELETE_TRACE] Resolved path for delete is invalid/empty: ${resolved}`);
                return null;
            }
            if (logs) console.log(`[DELETE_TRACE] Resolved safe path for deletion: ${resolved}`);
            return resolved;
        } catch (e) {
            if (logs) console.error(`[DELETE_WARN] Failed to resolve path for deletion (likely security block):`, e.message);
            return null; 
        }
    }
};