//B"H
/**
 * Transfer script from DosDB to awtsmoosDB
 * Recreating the structure of the database in a new vessel.
 */
var DosDB = require("../DosDB/index.js");
var awtsmoosDB = require("../DosDB/awtsmoosBinary/awtsmoosDB");

(async () => {
    try {
        console.log("B\"H\nInitializing Transfer...");
        
        // Initialize the Source (DosDB)
        var db = new DosDB("../../../dayuhChadash"); 
        
        // Initialize the Destination (awtsmoosDB)
        var adb = new awtsmoosDB("../../../awtsmoosDayuh");
        await adb.open();

        console.log("Traversing Source Database (DosDB)...");
        
        // Traverse the entire DosDB structure.
        // options.loadContent = true ensures we fetch the data (sparks) from the files.
        const sourceDataTree = await db.traverse("/", {
            loadContent: true,
            onProgress: (info) => {
                // Feedback on the progress of gathering the sparks
                if (info.count % 50 === 0) {
                    process.stdout.write(`\rFound ${info.count} items... (Depth: ${info.depth})`);
	              //  console.log(info);
                }
            }
        });
        
        console.log("\nTraversal Complete. Transforming structure...",sourceDataTree );

        // Transform the node tree from traverse() into a nested object structure
        // that awtsmoosDB's proxy root can accept.
        const transferObject = convertNodeToObj(sourceDataTree);

        console.log("Writing to Destination Database (awtsmoosDB)...",transferObject );
        
        // Assigning the object to adb.root triggers the recursive write via proxies
        // reflecting the entire structure into the new existence.
     
        adb.root.wow = transferObject;
		await adb.waitForIdle();
		var r = await adb.root.wow
        console.log("Transfer Successfully Completed.",r);
        
        await adb.close();

    } catch (e) {
        console.error("Error during transfer:", e);
    }
})();

/**
 * Converts the recursive node structure from DosDB.traverse 
 * into a plain nested object for assignment to awtsmoosDB.
 * @param {object} node - The current node from traversal.
 * @returns {object|string|Buffer} - The data for awtsmoosDB.
 */
function convertNodeToObj(node) {
    // If it is the root or a directory, process children
    if (node.type === 'directory' || (node.name === 'root' && node.children)) {
        const directoryObj = {};
        
        if (Array.isArray(node.children)) {
            for (const child of node.children) {
                // Recursively convert children
                // We use the clean name (without extension) as the key
                directoryObj[child.name] = convertNodeToObj(child);
            }
        }
        return directoryObj;
    } 
    // If it is a file, return its content (The Essence)
    else if (node.type === 'file') {
        return node.content;
    }
    
    return null;
}