// B"H
//B"H
const os = require("../../ayzarim/DosDB/awtsmoosFs/fsOperations.js");
const path = require("path");
var bin = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON.js")
const FILESYSTEM_PATH = 
    "/home/yackov/Documents/git/awts.awtsmoosFs";

  // "/home/yackov/Documents/dayuh/awtsmoosOs.awtsmoosFs";

(async () => {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: node cli.js <command> <path>");
        console.log("Commands: list, read, stat");
        process.exit(1);
    }

    const command = args[0];
    const targetPath = args[1];
    var fs = await os.setupFilesystem(FILESYSTEM_PATH);
   // fs = FILESYSTEM_PATH
    try {
        if (command === "list") {
            let contents = await os.readFolder({ filePath: fs, path: targetPath, withValues: true });
            console.log("Contents of", targetPath, ":", contents);
        } else if(command == "super") {
            let contents = await os.getSuperBlock(fs);
           console.log("superblock of", targetPath, ":", contents);
        } else if (command === "readBlock") {
            let fileData = await os.readBlock({ filePath: fs, blockId: targetPath });
            var data = fileData.data;
            var ser;
           
            ser = (data+"").substring(0,7)+"..";
            console.log("File content:", fileData, ser);
        } else if (command === "readBlockFull") {
            let fileData = await os.readBlock({ filePath: fs, blockId: targetPath });
            var data = fileData.data;
            var ser;
            if(await bin.isAwtsmoosObject(data)) {
                try {
                    ser = await bin.deserializeBinary(data);
                } catch(e) {
                    console.log("COULDNT gget awts",e)
                }
            }
            else ser = (data+"")
            console.log("File content:", fileData, ser);
        } else if (command === "read") {
            let fileData = await os.readFile({ filePath: fs, path: targetPath });
            console.log("File content:", fileData);
        } else if (command === "stat") {
            let stats = await os.stat({ filePath: fs, path: targetPath });
            console.log("File stats:", stats);
        } else {
            console.log("Unknown command.");
        }
        
    } catch (error) {
        console.error("Error:", error.message);
    }
})();