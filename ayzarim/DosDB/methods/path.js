//B"H
/**
 * path methods for DosDB class
 * This version uses a robust and secure method for path resolution, fixing the root directory bug.
 */

const path = require("path");
const fs = require("fs").promises;

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
             // Return as-is or throw, depending on desired strictness for non-string/empty input.
             // Returning it as-is will likely cause later fs/stat calls to fail, which might be intended.
             return id; 
        }

        // Determine the base directory. `this.directory` should be set by the class instance.
        const mainDir = path.resolve(this.directory || process.cwd());
        
        // --- ROBUST PATH SANITIZATION AND RESOLUTION ---
        
        // 1. Sanitize the input: Remove any leading slashes or backslashes to force it to be treated as a relative segment.
        // This is critical for preventing path.resolve from treating the input as an absolute path that overrides mainDir.
        const sanitizedId = id.replace(/^[/\\]+/, '');
        
        // 2. Resolve against the main directory. 
        // path.resolve joins segments, normalizing separators (e.g., converting C:\foo\..\bar to C:\bar on Windows).
        let resolvedPath = path.resolve(mainDir, sanitizedId);

        // 3. **THE ULTIMATE SECURITY GUARANTEE (Path Containment Check)**
        // This check ensures that no matter what path manipulation occurred (e.g., ../../..), 
        // the final, resolved, absolute path is still a child of the main directory.
        // We normalize both paths to ensure a clean comparison, especially important on Windows.
        const normalizedMainDir = path.normalize(mainDir) + path.sep; // Add path separator for accurate containment check
        const normalizedResolvedPath = path.normalize(resolvedPath);

        if (!normalizedResolvedPath.startsWith(normalizedMainDir)) {
            // This block executes if the path traversal worked (e.g., input was '../../etc/passwd')
            console.error(`[SECURITY_FAIL] Path traversal attempt detected and blocked:
              - Base Directory: ${mainDir}
              - Original Input:   ${id}
              - Sanitized Input:  ${sanitizedId}
              - Resolved Path:    ${resolvedPath}`);
            throw new Error(`Path traversal attempt detected: ${id}`);
        }
        // --- END OF FIX ---

        // --- The path is now safe, absolute, and guaranteed to be inside mainDir. Proceed with finding logic. ---
	    // Use console.log sparingly in production, but keeping it here for your direct debugging visibility.
	    console.log("TRYING TO GET", resolvedPath) 
        
        if (isDir) {
            // If the caller explicitly wants a directory, we return the resolved path as-is.
            return resolvedPath;
        }
        
        // --- File Existence Priority Checks (Only for non-directories) ---
        
        // Priority 1: Check if the path exists AS-IS.
        try {
            await fs.access(resolvedPath);
            return resolvedPath;
        } catch(e) {
	        // Does not exist, continue to extension checks
        }

        // Priority 2: Check for path + .awtsmoosJSON.
        const awtsmoosJsonPath = `${resolvedPath}.awtsmoosJSON`;
        try {
            await fs.access(awtsmoosJsonPath);
            return awtsmoosJsonPath;
        } catch {}

        // Priority 3: Check for path + .json.
        const jsonPath = `${resolvedPath}.json`;
        try {
            await fs.access(jsonPath);
            return jsonPath;
        } catch {}

        // Priority 4: Default to resolvedPath for creation.
        // This path is safe and is where the file will be written if it doesn't exist.
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
        // getAwtsmoosFilePath will throw an error if a path traversal is detected.
        const resolvedPath = await this.getAwtsmoosFilePath(rPath);

        if (alsoActuallyMakeParentDirectory) {
            // Use the fully resolved path to determine the parent directory.
            const parentDir = path.dirname(resolvedPath);
            await this.ensureDir(parentDir); // Ensure the parent directory structure exists
        }
        
        return resolvedPath;
    },
    
    /**
     * @method getAwtsmoosParentPath
     * @description Ascends a path to its parent directory.
     * @param {string} currentPath - The path from which to get the parent.
     * @returns {Promise<string|null>} - The parent path, or null if at the root.
     */
    async getAwtsmoosParentPath(currentPath) {
        if (typeof currentPath !== 'string' || !currentPath) return null;
        try {
            const normalizedPath = path.normalize(currentPath);
            const parentPath = path.dirname(normalizedPath);
            // Check if dirname returned the same path (root) or just '.' (relative root)
            if (parentPath === normalizedPath || parentPath === ".") {
                return null;
            }
            return parentPath;
        } catch (err) {
            console.error("Error getting parent path:", err);
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
            // Use getAwtsmoosFilePath to resolve the absolute, safe path first.
            const myPath = await this.getAwtsmoosFilePath(filePath, isDir);
            
            // After resolution, we must check if the resolved path actually exists on disk.
            // Note: If isDir is false, getAwtsmoosFilePath might return a non-existent path
            // intended for *creation*, so fs.access will correctly fail here if it doesn't exist.
            await fs.access(myPath); 
            
            const stat = await fs.stat(myPath);
            stat.awtsmoosPath = myPath;
            return stat;
        } catch (e) {
            // If fs.access fails (ENOENT, EACCES) or getAwtsmoosFilePath throws security error.
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
             console.log(`[ENSURE_DIR_WARN] Invalid path provided to ensureDir: ${targetPath}`);
             return;
        }

        let directoryToEnsure;

        if (isDir) {
            // The path we received IS the directory to create.
            directoryToEnsure = targetPath;
        } else {
            // The path we received is a FILE path (often the result of getAwtsmoosFilePath).
            // We must operate on its PARENT directory.
            directoryToEnsure = path.dirname(targetPath);
        }
        
        // fs.mkdir with { recursive: true } is idempotent and safe; it creates all necessary parents.
        await fs.mkdir(directoryToEnsure, { recursive: true });
        
        return directoryToEnsure;
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
            // This will throw if security check fails, or return the safe, absolute path.
            return await this.getAwtsmoosFilePath(id, isRegularDir);
        } catch (e) {
            console.error("Failed to resolve path for deletion due to security or invalid input:", e.message);
            return null; // Return null to prevent calling fs.stat/fs.unlink on an unsafe path.
        }
    }
};