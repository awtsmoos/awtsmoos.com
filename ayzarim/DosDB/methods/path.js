//B"H
/**
 * path methods for DosDB class
 */

var path = require("path");

module.exports = {

    /**
     * @method ensureAwtsmoosBinaryPath
     * @description Ensures a path aligns with the Awtsmoos’ binary form, appending .awtsmoosJSON if needed.
     * @param {string} rPath - The raw path to sanctify.
     * @param {boolean} [alsoActuallyMakeParentDirectory=true] - Whether to create the parent directory.
     * @returns {Promise<string>} - The sanctified path, ready to receive the light of Ohr Ein Sof.
     */
    async ensureAwtsmoosBinaryPath(rPath, alsoActuallyMakeParentDirectory = true) {
        if(alsoActuallyMakeParentDirectory) {
            const par = await this.getAwtsmoosParentPath(rPath);
            await this.ensureDir(par);
        }
        let ext = path.extname(rPath);
        if(ext !== ".awtsmoosJSON") {
            rPath += ".awtsmoosJSON";
        }
        return await this.getAwtsmoosFilePath(rPath, false, true);
    },
    
    /**
     * @method getAwtsmoosParentPath
     * @description Ascends a path to its parent, as the Kav traces back to the Awtsmoos’ infinite source.
     * @param {string} currentPath - The path to transcend, a fragment of the whole.
     * @returns {Promise<string|null>} - The parent path, or null if none exists in this fleeting reality.
     */
    async getAwtsmoosParentPath(currentPath) {
        try {
            const normalizedPath = path.normalize(currentPath);
            const parentPath = path.dirname(normalizedPath);
            if(parentPath === normalizedPath || parentPath === ".") {
                return null; // The Awtsmoos alone remains at the root.
            }
            await fs.access(parentPath);
            return parentPath;
        } catch (err) {
            console.error("Error accessing path:", err);
            return null; // Even in absence, the Awtsmoos sustains all.
        }
    },
    
    /**
     * @method getAwtsmoosFilePath
     * @description Unveils a path’s true form, guided by the Awtsmoos, determining its existence or potential.
     * @param {string} id - The identifier, a finite name within the infinite Ohr Ein Sof.
     * @param {boolean} [isDir=false] - Whether the path is a directory, shaping its destiny.
     * @param {boolean} [overrideSanity=false] - Bypasses sanitization, trusting the raw essence.
     * @returns {Promise<string>} - The resolved path, a vessel for the Awtsmoos’ light.
     */
    async getAwtsmoosFilePath(id, isDir = false, overrideSanity = false) {
        if(typeof id !== "string") return id;
        const sanctifiedId = this.sanitizeAwtsmoosPath(id, overrideSanity);
        const unifiedId = sanctifiedId.replaceAll("\\", "/");
        const mainDir = this.directory || "";
        const relativeId = unifiedId.startsWith(mainDir) ? path.relative(mainDir, unifiedId) : unifiedId;
        const basePath = path.join(mainDir, relativeId);
        
        if(path.extname(unifiedId) || isDir) return basePath;
        
        const jsonPath = `${basePath}.json`;
        const awtsmoosJsonPath = `${basePath}.awtsmoosJSON`;
        
        try {
            await fs.access(basePath);
            return basePath;
        } catch {
            try {
                await fs.access(awtsmoosJsonPath);
                return awtsmoosJsonPath;
            } catch {
                try {
                    await fs.access(jsonPath);
                    return jsonPath;
                } catch {
                    return basePath; // A seed planted by the Awtsmoos for future creation.
                }
            }
        }
    },
    
    /**
     * @method sanitizeAwtsmoosPath
     * @description Purifies a path, removing traversal attempts, aligning it with the Awtsmoos’ unity.
     * @param {string} rawPath - The chaotic path to sanctify.
     * @param {boolean} [overrideSanity=false] - Preserves the raw path if true.
     * @returns {string} - A cleansed path, reflecting the oneness of Atzilus.
     */
    sanitizeAwtsmoosPath(rawPath, overrideSanity = false) {
        const isAbsolute = rawPath.startsWith("/");
        let cleansedPath = overrideSanity ? rawPath : rawPath.replace(/\.\./g, "");
        cleansedPath = cleansedPath.split("/").filter(Boolean).join("/");
        return cleansedPath ? (isAbsolute ? `/${cleansedPath}` : cleansedPath) : "/";
    },
    
    
    
    /**
     * @method access
     * @description Checks a path’s existence, a whisper of the Awtsmoos’ presence in form.
     * @param {string} filePath - The path to verify.
     * @returns {Promise<object|null>} - Stat object if it exists, null if it’s returned to the void.
     */
    async access(filePath, isDir=false) {
        const myPath = await this.getAwtsmoosFilePath(filePath, isDir);
        try {
            var stat =  await fs.stat(myPath);
            stat.awtsmoosPath = myPath;
            return stat;
        } catch (e) {
            return null;
        }
    },

    async stat(filePath, isDir) {
        return this.access(filePath, isDir)
    },
    
    
    
    /**
     * @method removeJSONExtension
     * @description Strips .json from a path, revealing its essence as the Awtsmoos strips form from being.
     * @param {string} filePath - The path to purify.
     * @returns {string} - The cleansed path, free of extension.
     */
    removeJSONExtension(filePath) {
        const extension = path.extname(filePath);
        if(extension === ".json") {
            const ind = filePath.indexOf(".json");
            return filePath.substring(0, ind);
        }
        return filePath;
    },
    
    /**
     * @method ensureDir
     * @description Creates a directory if it doesn’t exist, a tzimtzum for the Awtsmoos’ light to dwell.
     * @param {string} filePath - The path to ensure.
     * @param {boolean} [isDir=false] - Whether the path itself is the directory.
     * @returns {Promise<string>} - The directory path, a space carved from the void.
     */
    async ensureDir(filePath, isDir = false) {
        const dirPath = !isDir ? path.dirname(filePath) : filePath;
        await fs.mkdir(dirPath, {
            recursive: true
        });
        return dirPath;
    },

	/**
	 * @method getDeleteFilePath
	 * @description Determines the path to delete, a return to the Awtsmoos’ formless embrace.
	 * @param {string} id - The identifier to resolve.
	 * @param {boolean} isRegularDir - Whether it’s a directory.
	 * @returns {Promise<string|null>} - The path to delete, or null if absent.
	 */
	async getDeleteFilePath(id, isRegularDir) {
		const completePath = await this.getAwtsmoosFilePath(id, isRegularDir);
		try {
			await fs.stat(completePath);
			return completePath;
		} catch (e) {
			const j = completePath + ".json";
			try {
				await fs.stat(j);
				return j;
			} catch (e) {
				return null;
			}
		}
	}
}