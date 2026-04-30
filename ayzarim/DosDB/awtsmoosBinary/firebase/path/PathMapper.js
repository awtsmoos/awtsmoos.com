
// B"H
/**
 * @file PathMapper.js
 * @description
 * All earthly paths must be elevated. A local path like "users/yosef"
 * becomes "awtsmoos/users/yosef" in the cloud. It grounds the local void into the shared universe.
 */

class PathMapper {
    /**
     * @constructor
     * @param {string} rootNamespace - The base node in Firebase.
     */
    constructor(rootNamespace = "awtsmoos") {
        this.rootNamespace = rootNamespace.replace(/\/+$/, "").replace(/^\/+/, "");
    }

    /**
     * @method toFirebase
     * @description Translates local to heavenly path.
     * @param {string} localPath 
     * @returns {string}
     */
    toFirebase(localPath) {
        if (!localPath || typeof localPath !== "string") {
            return this.rootNamespace;
        }

        let cleanPath = localPath
            .replace(/^\/+/, "")
            .replace(/\/+$/, "")
            .replace(/\.json$/i, "")
            .replace(/\.awts$/i, "");

        cleanPath = cleanPath.replace(/\\/g, "/");

        if (!cleanPath) return this.rootNamespace;

        return `${this.rootNamespace}/${cleanPath}`;
    }

    /**
     * @method toLocal
     * @description Pulls heavenly path back down to earth.
     * @param {string} firebasePath 
     * @returns {string}
     */
    toLocal(firebasePath) {
        if (!firebasePath || typeof firebasePath !== "string") return "";

        const prefix = this.rootNamespace + "/";
        if (firebasePath.startsWith(prefix)) {
            return firebasePath.slice(prefix.length);
        }

        return firebasePath.replace(/^\/+/, "");
    }
}

module.exports = PathMapper;
