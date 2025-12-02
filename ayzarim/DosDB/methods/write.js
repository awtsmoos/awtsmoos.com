//B"H
/**
 * write methods for DosDB class
 */

const awtsmoosBinary = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js")

var fs = require("fs").promises;
var path = require("path");

module.exports = {
    /**
     * @method write
     * @description Inscribes a record into the filesystem, a finite act of the Awtsmoos’ infinite renewal.
     * @param {string} id - The identifier for the record.
     * @param {object|Buffer} record - The data to write, a vessel of light or form.
     * @param {object} opts - Options for writing, guiding the Kav’s descent.
     * @returns {Promise<void|object>} - Resolves when written, or an error object if the void resists.
     */
    async write(
        id, record,
        opts = {}
    ) {

        const isDir = !record;
        if (isDir) {
            const filePath = await this.getAwtsmoosFilePath(id, true, false);

            await this.ensureDir(filePath, isDir);
        }
        try {
            if (
                typeof record === "string" ||
                record instanceof Buffer
            ) {
                try {
                    const filePath = await this.getAwtsmoosFilePath(id, isDir, false);

                    await this.ensureDir(filePath, isDir);

                    await this.delete(id);

                    await fs.writeFile(filePath, record);
                } catch (e) {
                    return {
                        error: e.stack,
                        type: "regular file write",
                        filePath,
                        record
                    };;
                }


            } else if (typeof record === "object") {


                try {


                    const filePath = await this.getAwtsmoosFilePath(id, isDir);

                    await this.ensureDir(filePath, isDir);

                    return await this.writeAsBinaryFormat(filePath, record, opts);
                } catch (e) {
                    console.log("WHAT", e);
                    return {
                        error: e.stack,
                        type: "awtsmoos file write",
                        filePath,
                        record
                    };;
                }


            }
        } catch (e) {
            return {
                error: e.stack
            };
        }
    },

    /**
     * @method rename
     * @description Moves or renames a record/directory. Cross-platform (handles EXDEV).
     *              Usage: db.rename("folder/oldName.txt", "folder/newName.txt")
     *                     db.rename("folder/oldName.txt", "otherFolder/oldName.txt")
     * @param {string} oldId - The current path/id relative to DB root.
     * @param {string} newId - The target path/id relative to DB root.
     * @returns {Promise<object>} - Success or error object.
     */
    async rename(oldId, newId) {
        try {
            // 1. Resolve Source Path
            // We set isDir=false initially to let the resolver discovery logic find what's actually there.
            const oldPath = await this.getAwtsmoosFilePath(oldId);

            // Validate Source Exists
            try {
                await fs.access(oldPath);
            } catch (e) {
                return {
                    error: {
                        message: "Source does not exist",
                        code: "ENOENT",
                        path: oldPath
                    }
                };
            }

            const stat = await fs.stat(oldPath);
            const isDir = stat.isDirectory();

            // 2. Resolve Destination Path
            // We pass automaticallyAddAwtsmoos=false because for a move/rename operation,
            // we assume the caller (API/OS) has provided the correct full destination filename/extension.
            const newPath = await this.getAwtsmoosFilePath(newId, isDir, false);

            // 3. Ensure Parent Directory Exists
            // We treat newPath as the target entry, so we ensure its parent directory exists.
            await this.ensureDir(newPath, false);

            // 4. Perform Rename (Move)
            try {
                await fs.rename(oldPath, newPath);
            } catch (err) {
                // Handle Cross-Device Move (e.g., moving between partitions)
                if (err.code === 'EXDEV') {
                    // Copy recursively and then remove source
                    // Node.js v16.7.0+ supports fs.cp
                    if (fs.cp) {
                        await fs.cp(oldPath, newPath, {
                            recursive: true,
                            force: true
                        });
                        await fs.rm(oldPath, {
                            recursive: true,
                            force: true
                        });
                    } else {
                        return {
                            error: {
                                message: "Node.js version too old for cross-device move (EXDEV)",
                                code: "OLD_NODE"
                            }
                        };
                    }
                } else {
                    throw err;
                }
            }

            return {
                success: {
                    message: "Moved successfully",
                    from: oldPath,
                    to: newPath
                }
            };

        } catch (e) {
            return {
                error: {
                    message: "Move/Rename failed",
                    code: "MOVE_ERR",
                    details: e.message,
                    stack: e.stack
                }
            };
        }
    },
    
    
    /**
     * @method copy
     * @description Duplicates a record, creating a perfect reflection of the Awtsmoos’ light in a new vessel.
     *              Utilizes the native strength of Node (fs.cp) to recursively replicate files and folders,
     *              multiplying existence without diminishing the Source.
     * @param {string} srcId - The path of the source vessel (file or folder).
     * @param {string} destId - The destination path where the new light will reside.
     * @returns {Promise<object>} - A promise of the new creation.
     */
    async copy(srcId, destId) {
        try {
            // 1. Resolve Source Path (The Emanator)
            const srcPath = await this.getAwtsmoosFilePath(srcId);
            
            // Check if source exists
            try {
                await fs.access(srcPath);
            } catch (e) {
                 return {
                    error: {
                        message: "Source vessel shattered (not found)",
                        code: "ENOENT",
                        path: srcPath
                    }
                };
            }

            // 2. Resolve Destination Path (The Receiver)
            // We verify if it is a directory logic internally
            const stat = await fs.stat(srcPath);
            const isDir = stat.isDirectory();
            
            const destPath = await this.getAwtsmoosFilePath(destId, isDir, false);

            // 3. Ensure the Space (Parent Directory) exists to hold the light
            await this.ensureDir(destPath, false);

            // 4. Perform the Copy (The Projection)
            // recursive: true allows folders to be copied with all their children
            await fs.cp(srcPath, destPath, { 
                recursive: true, 
                force: false, // Do not overwrite blindly, respect the boundaries
                errorOnExist: true 
            });

            return {
                success: {
                    message: "Light multiplied successfully",
                    src: srcPath,
                    dest: destPath
                }
            };

        } catch (e) {
            return {
                error: {
                    message: "Failed to copy vessel",
                    code: "COPY_ERR",
                    details: e.message,
                    stack: e.stack
                }
            };
        }
    },

    /**
     * @method writeAsBinaryFormat
     * @description Serializes an object into .awtsmoosJSON, a binary vessel of the Awtsmoos’ essence.
     * @param {string} rPath - The path to write to.
     * @param {object} r - The object to serialize.
     * @param {object} opts - Options for the process.
     * @returns {Promise<object>} - Success or error object, reflecting the act of creation.
     */
    async writeAsBinaryFormat(
        rPath, r,
        opts = {}
    ) {
        var customWriter = opts?.customWriter;

        if (typeof rPath !== "string" || !rPath) {
            return {
                error: {
                    message: "Make sure path is valid",
                    code: "INVALID_PATH"
                }
            };
        }
        if (typeof r !== "object" || !r) {
            return {
                error: {
                    message: "Only enter an object for serialization",
                    code: "ONLY_OBJ_OR_ARRAY"
                }
            };
        }

        try {
            const awtsJson = (


                awtsmoosBinary
            )?.serializeJSON?.(r);

            if (!awtsJson) {
                return {
                    error: "Issue doing stuff",
                    path: rPath
                }
            }
            const myPath = await this.ensureAwtsmoosBinaryPath(rPath);


            const wrote = await fs.writeFile(myPath, awtsJson);
            try {
                //    console.log("rading",myPath,awtsJson);
                //    var d = awtsmoosBinary?.deserializeBinary(awtsJson);
                //   console.log("Got",d);
            } catch (e) {
                console.log(e)
            }
            return {
                success: {
                    wrote,
                    joined: myPath,
                    rPath
                }
            };
        } catch (e) {
            console.log(e);
            return {
                error: e.stack,
                rPath
            };
        }
    },


    /**
     * @method create
     * @description Creates a new record, a birth from the Awtsmoos’ void into form.
     * @param {string} id - The identifier for the record.
     * @param {object} record - The data to inscribe.
     * @returns {Promise<void>} - Resolves when the record is formed.
     */
    async create(id, record) {
        await this.write(id, record);
    },

    /**
     * @method update
     * @description Updates a record, merging its essence with new light from the Awtsmoos.
     * @param {string} id - The identifier for the record.
     * @param {object} record - The updated data.
     * @returns {Promise<void>} - Resolves when the record is transformed.
     */
    async update(id, record) {
        const existing = await this.get(id);
        if (existing === null) {
            throw new Error(`Record with id "${id}" does not exist.`);
        }
        await this.write(id, {
            ...existing,
            ...record
        });
    },


    /**
     * @method delete
     * @description Removes a file or directory, dissolving it back into the Awtsmoos’ void.
     * @param {string} id - The identifier to erase.
     * @param {boolean} [isRegularDir=false] - Whether it’s a directory.
     * @returns {Promise<object|boolean>} - Success object or false if absent.
     */
    async delete(id, isRegularDir = false) {
        const filePath = await this.getDeleteFilePath(id, isRegularDir);
        try {
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
                await fs.unlink(filePath);
            } else if (stat.isDirectory()) {
                await fs.rm(filePath, {
                    recursive: true
                });
            }
            return {
                success: {
                    message: "Deleted it",
                    path: filePath,
                    id
                }
            };
        } catch (error) {
            if (error.code !== "ENOENT") {
                return {
                    error: {
                        message: "There was an error",
                        stack: error.stack
                    }
                };
            }
            return false;
        }
    }
}