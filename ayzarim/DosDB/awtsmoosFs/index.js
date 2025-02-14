/**
 * B"H
 * 
 * replaces the fs.promises module
 * to use a custom awtsmoos file system OS
 * instead of standard file system
 */


var os = require("../awtsmoosBinary/awtsmoosBinaryOS.js");
/**
 * methods:
 * os.setupEmptyFilesystem(path)
 *  returns a file handle object to use with
 * other functions.
 * 
 * other functions:
 * 
 * all of them are async
 *  readBlock,
	makeFolder({
        file/*the fileHandle object form b4* /, 
        path
    }),
	
    same args for all other funcitons
    
    makeFile,
	readFolder,
	readFile,

	deleteFile,
	deleteFolder,
	stat
 */

class FileHandle {
    constructor(path, handle) {
        this.path = path;
        this.handle = handle;
    }
    
    async read(buffer, offset, length, position = 0) {
        const data = await os.readFile({ file: this.handle, path: this.path });
        const bufData = Buffer.from(data);
        const slice = bufData.slice(position, position + length);
        slice.copy(buffer, offset);
        return { bytesRead: slice.length, buffer };
    }
    
    async write(buffer, offset, length, position = 0) {
        let existing = "";
        try {
        existing = await os.readFile({ file: this.handle, path: this.path });
        } catch (e) {}
        const newData = buffer.toString("utf8", offset, offset + length);
        const updated =
        position >= existing.length
            ? existing + newData
            : existing.substring(0, position) + newData + existing.substring(position + length);
        await os.makeFile({ file: this.handle, path: this.path, data: updated });
        return { bytesWritten: newData.length, buffer };
    }
    
    async close() {}
    }
    
class AwtsmoosFS {
    constructor(rootPath) {
        this.root = rootPath;
    }
    
    async initialize(rootPath) {
        if(rootPath)
            this.root = rootPath;
        this.handle = await os.setupFilesystem(
            this.root
        );
        return this.handle;
    }
    
    async access(path, mode) {
        await os.stat({ file: this.handle, path });
    }
    
    async appendFile(path, data, options) {
        let existing = "";
        try {
        existing = await os.readFile({ file: this.handle, path });
        } catch (e) {}
        await os.makeFile({ file: this.handle, path, data: existing + data });
    }
    
    async copyFile(src, dest, flags) {
        const data = await os.readFile({ file: this.handle, path: src });
        await os.makeFile({ file: this.handle, path: dest, data });
    }
    
    async mkdir(path, options) {
       
        
        await os.makeFolder({ file: this.handle, path });
    }
    
    async open(path, flags, mode) {
        if (flags.includes("w") || flags.includes("a")) {
        try {
            await os.readFile({ file: this.handle, path });
        } catch (e) {
            await os.makeFile({ file: this.handle, path, data: "" });
        }
        }
        return new FileHandle(path, this.handle);
    }
    
    async readdir(path, options) {
        return await os.readFolder({ file: this.handle, path });
    }
    
    async readFile(path, options) {
        const data = await os.readFile({ file: this.handle, path });
        return options?.encoding ? data.toString(options.encoding) : Buffer.from(data);
    }
    
    async writeFile(path, data, options) {
        await os.makeFile({ file: this.handle, path, data });
    }
    
    async rename(oldPath, newPath) {
        const data = await os.readFile({ file: this.handle, path: oldPath });
        await os.makeFile({ file: this.handle, path: newPath, data });
        await os.deleteFile({ file: this.handle, path: oldPath });
    }
    
    async rm(path, options) {
        try {
            const stats = await os.stat({ file: this.handle, path });
            if (stats.type === "file") {
            await os.deleteFile({ file: this.handle, path });
            } else {
            await os.deleteFolder({ file: this.handle, path });
            }
        } catch(e) {
            
        }
    }
    
    async stat(path) {
        return await os.stat({ file: this.handle, path });
    }
    
    async unlink(path) {
        await os.deleteFile({ file: this.handle, path });
    }
    }
    
    module.exports = AwtsmoosFS;
