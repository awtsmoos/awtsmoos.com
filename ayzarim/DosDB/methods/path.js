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
        if (typeof id !== "string") return id;

        const mainDir = path.resolve(this.directory || process.cwd());
        
        // --- THE PERMANENT FIX ---
        // The core issue is that paths like "/social/aliases" are treated as
        // root-of-the-drive on Windows by path.join and path.resolve.
        // To fix this permanently and cross-platform, we must first sanitize
        // the input `id` to remove any leading slashes, forcing it to be relative.
        // The regex /^[/\\]+/ removes one or more leading slashes or backslashes.
        const sanitizedId = id.replace(/^[/\\]+/, '');

        // Now that `sanitizedId` is guaranteed to be a relative path segment,
        // we can safely resolve it against our main directory. `path.resolve`
        // is robust and will correctly join the parts and normalize the result.
        const resolvedPath = path.resolve(mainDir, sanitizedId);
        // --- END OF FIX ---

        // Security check: This remains the ultimate safeguard.
        // It ensures that even if the input was something like `../.../etc/passwd`,
        // the final resolved path is still checked to be within our secure directory.
        if (!resolvedPath.startsWith(mainDir)) {
            console.error(`Path validation failed:
              - Base Directory: ${mainDir}
              - Original Input:   ${id}
              - Sanitized Input:  ${sanitizedId}
              - Resolved Path:    ${resolvedPath}`);
            throw new Error(`Path traversal attempt detected: ${id}`);
        }

        // --- The path is now safe and absolute. Proceed with finding logic. ---

        if (isDir) {
            return resolvedPath;
        }
        
        // Priority 1: Check if the path exists AS-IS.
        try {
            await fs.access(resolvedPath);
            return resolvedPath;
        } catch(e) {
	        // Does not exist, continue
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
        const resolvedPath = await this.getAwtsmoosFilePath(rPath);

        if (alsoActuallyMakeParentDirectory) {
            const parentDir = path.dirname(resolvedPath);
            await this.ensureDir(parentDir);
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
        try {
            const normalizedPath = path.normalize(currentPath);
            const parentPath = path.dirname(normalizedPath);
            return (parentPath === normalizedPath || parentPath === ".") ? null : parentPath;
        } catch (err) {
            console.error("Error getting parent path:", err);
            return null;
        }
    },

    // The complex sanitizeAwtsmoosPath function is no longer needed, as the logic is now safely
    // handled inside getAwtsmoosFilePath. We can remove it or keep a stub if other code relies on it.
    sanitizeAwtsmoosPath(rawPath) {
        return rawPath; // Sanitization is now implicit in getAwtsmoosFilePath
    },

    /**
     * @method access
     * @description Checks for a path's existence and returns its stats.
     * @param {string} filePath - The path to verify.
     * @returns {Promise<object|null>} - Stat object if it exists, null otherwise.
     */
    async access(filePath, isDir = false) {
        try {
            const myPath = await this.getAwtsmoosFilePath(filePath, isDir);
            // Re-check existence as getAwtsmoosFilePath returns a default path for creation.
            await fs.access(myPath); 
            const stat = await fs.stat(myPath);
            stat.awtsmoosPath = myPath;
            return stat;
        } catch (e) {
            return null;
        }
    },
    
    async stat(filePath, isDir) {
        return this.access(filePath, isDir);
    },

    /**
     * @method removeJSONExtension
     * @description Strips .json or .awtsmoosJSON from a file path.
     * @param {string} filePath - The path to purify.
     * @returns {string} - The path without the extension.
     */
    removeJSONExtension(filePath) {
        const extension = path.extname(filePath);
        if (extension === ".json" || extension === ".awtsmoosJSON") {
            return filePath.substring(0, filePath.length - extension.length);
        }
        return filePath;
    },

    /**
     * @method ensureDir
     * @description Creates a directory if it doesn’t exist.
     *              This function is intelligent: if it receives a file path
     *              (indicated by isDir=false), it will ensure the file's
     *              PARENT directory exists.
     * @param {string} targetPath - The directory path OR file path to ensure.
     * @param {boolean} [isDir=true] - If true, treats targetPath as a directory.
     *                                 If false, treats it as a file path.
     * @returns {Promise<string>} - The path of the directory that was ensured.
     */
    async ensureDir(targetPath, isDir = true) {
        if (typeof targetPath !== "string" || !targetPath) {
             console.log("Invalid path provided to ensureDir", targetPath);
             return;
        }

        // --- THIS IS THE AUTOMATIC LOGIC ---
        let directoryToEnsure;

        if (isDir) {
            // The path we received IS the directory to create.
            directoryToEnsure = targetPath;
        } else {
            // The path we received is a FILE path.
            // We must operate on its PARENT directory.
            directoryToEnsure = path.dirname(targetPath);
        }
        // --- END OF AUTOMATIC LOGIC ---

        // Now, we can safely call mkdir on the correctly identified directory path.
        // The recursive flag prevents errors if the directory already exists.
        await fs.mkdir(directoryToEnsure, { recursive: true });
        
        return directoryToEnsure;
    },

    /**
     * @method getDeleteFilePath
     * @description Resolves the absolute path for a file/directory to be deleted.
     * @param {string} id - The identifier to resolve.
     * @param {boolean} isRegularDir - Whether it’s a directory.
     * @returns {Promise<string|null>} - The absolute path to delete.
     */
    async getDeleteFilePath(id, isRegularDir) {
        return this.getAwtsmoosFilePath(id, isRegularDir);
    }
};