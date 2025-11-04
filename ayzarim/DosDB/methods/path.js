//B"H
/**
 * path methods for DosDB class
 * This version uses a robust and secure method for path resolution, fixing the root directory bug.
 */

const path = require("path");
const fs = require("fs").promises;

const logs = true; // Flag to control debug logging

module.exports = {

    /**
     * @method getAwtsmoosFilePath
     * @description THE CORE FINDER LOGIC. Securely resolves a path ID against the main directory.
     *              It follows the priority: AS-IS > .awtsmoosJSON > .json.
     * @param {string} id - The identifier, filename, or relative path.
     * @param {boolean} [isDir=false] - If true, treats the path as a directory.
     * @returns {Promise<string>} - The resolved, absolute, and safe path.
     */
    async getAwtsmoosFilePath(id, isDir = false) {
        if (typeof id !== "string" || !id) {
             if (logs) console.log(`[PATH_WARN] Received non-string or empty ID: ${id}. Returning as-is.`);
             return id; 
        }

        // Determine the base directory.
        const mainDir = path.resolve(this.directory || process.cwd());
        
        // --- ROBUST PATH SANITIZATION AND RESOLUTION ---
        
        // 1. Sanitize the input: Remove any leading slashes or backslashes.
        const sanitizedId = id.replace(/^[/\\]+/, '');
        
        // --- DEBUG LOGGING FOR INPUT TRANSFORMATION ---
        if (logs) {
            console.log(`\n[PATH_TRACE] Input ID: ${id}`);
            console.log(`[PATH_TRACE] Main Directory (Base): ${mainDir}`);
            console.log(`[PATH_TRACE] Sanitized ID (Post-Slash Removal): ${sanitizedId}`);
        }
        // --- END DEBUG LOGGING ---

        // 2. Resolve against the main directory.
        let resolvedPath = path.resolve(mainDir, sanitizedId);
        
        // 3. **THE ULTIMATE SECURITY GUARANTEE (Path Containment Check)**
        // We normalize both paths to ensure a clean, platform-agnostic comparison of containment.
        const normalizedMainDir = path.normalize(mainDir) + path.sep; 
        const normalizedResolvedPath = path.normalize(resolvedPath);

        if (!normalizedResolvedPath.startsWith(normalizedMainDir)) {
            // This should catch traversal attempts like ../../etc/passwd
            if (logs) {
                console.error(`[SECURITY_FAIL] Path traversal attempt detected and BLOCKED:
                  - Base Directory: ${mainDir}
                  - Original Input:   ${id}
                  - Sanitized Input:  ${sanitizedId}
                  - Resolved Path:    ${resolvedPath}`);
            }
            throw new Error(`Path traversal attempt detected: ${id}`);
        }
        
        // **CRITICAL CHECK FOR DUPLICATION:**
        // If the duplication seen in logs occurs, it means sanitizedId started with something that
        // *looks* like mainDir but isn't properly relative to it, causing concatenation.
        // If the resolved path still starts with mainDir, we proceed, but we log the potential issue.
        if (logs && normalizedResolvedPath.includes(path.join(mainDir, mainDir))) {
             console.warn(`[PATH_WARN] Resolved path appears to contain a duplicated base directory structure. Proceeding as the path is contained: ${resolvedPath}`);
        }


        // --- The path is now safe, absolute, and guaranteed to be inside mainDir. Proceed with finding logic. ---
        if (logs) console.log(`[PATH_FINAL] Absolute/Safe Path: ${resolvedPath}`);
	    
        if (isDir) {
            return resolvedPath;
        }
        
        // --- File Existence Priority Checks (Only for non-directories) ---
        
        // Priority 1: Check if the path exists AS-IS.
        try {
            await fs.access(resolvedPath);
            if (logs) console.log("[PATH_FIND] Found path AS-IS.");
            return resolvedPath;
        } catch(e) {
	        if (logs) console.log("[PATH_FIND] AS-IS not found. Checking extensions...");
        }

        // Priority 2: Check for path + .awtsmoosJSON.
        const awtsmoosJsonPath = `${resolvedPath}.awtsmoosJSON`;
        try {
            await fs.access(awtsmoosJsonPath);
            if (logs) console.log(`[PATH_FIND] Found extension: .awtsmoosJSON at ${awtsmoosJsonPath}`);
            return awtsmoosJsonPath;
        } catch {}

        // Priority 3: Check for path + .json.
        const jsonPath = `${resolvedPath}.json`;
        try {
            await fs.access(jsonPath);
            if (logs) console.log(`[PATH_FIND] Found extension: .json at ${jsonPath}`);
            return jsonPath;
        } catch {}

        // Priority 4: Default to resolvedPath for creation.
        if (logs) console.log("[PATH_FINAL] Path not found. Returning resolved path for CREATE operation.");
        return resolvedPath;
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
        
        // This call will throw if security check fails.
        const resolvedPath = await this.getAwtsmoosFilePath(rPath);

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

    // Sanitization is now implicitly handled within getAwtsmoosFilePath.
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
            if (typeof myPath !== 'string' || !myPath) return null; // Handle early exit from getAwtsmoosFilePath
            
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
             throw err; // Re-throw to signal failure to the caller (like write/ensureAwtsmoosBinaryPath)
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
            return null; // Return null if getAwtsmoosFilePath throws (e.g., security violation)
        }
    }
};