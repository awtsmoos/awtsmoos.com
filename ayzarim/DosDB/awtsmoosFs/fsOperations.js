//B"H
var {
    initializeFileSystem,
    writeAtNextFreeBlock,
    readBlock,
    deleteEntry,
    setupFilesystem: initializeFileSystem,
    awtsmoosJSON,
    getSuperBlock
} = require("./blocks");


// Normalize a given path string into an array of folder names.
// E.g., "/hi/there/wow"  →  ["hi", "there", "wow"]
// and "/" becomes [] meaning the root folder.
function normalizePath(path) {
    if (typeof path !== "string") {
        if(Array.isArray(path)) {
            return path
        } else return null;
    };
    return path
      .split("\\")
     
      .join("/")
      .split("/")
      .filter(Boolean);

}

// Reads a folder from the simulated database file.
// Always starts by reading the root block (ID 1) and then walks down the folder structure.
// If withValues is true, returns an object mapping folder/file names to block IDs;
// otherwise, returns just an array of names.
async function readFolder({
    filePath,
    path,
    withValues = false
}) {
    path = normalizePath(path);
    if(!path) {
        console.log("NO path",path)
        return null;
    }
    var name = path.pop();
    
    
    // Always start with the root block.
    var block = await readBlock({
        filePath,
        blockId: 1
    });
    var data = block.data;
    

    if (!(await awtsmoosJSON
        .isAwtsmoosObject(data))) {
        return null//data
    }

    // Deserialize the binary folder data.
    let folderObj = (data);

    // If no further path is provided, return the entire object.
    if (!name) {
        return withValues ?
            await awtsmoosJSON
            .deserializeBinary(folderObj) : 
            
            await awtsmoosJSON.getKeysFromBinary(
                folderObj
            )
    }

    
    
    var parentFolderIDToReadFrom = await getCurrentFolder({
        filePath, path, name
    });

    
    if(parentFolderIDToReadFrom) {
        
        var folderToRead = parentFolderIDToReadFrom;
     
        
        if(!folderToRead) {
            
            
            return null;
        } 
        var parentFold = await readFolderData({
            filePath,
            blockId: folderToRead
        })
        if(!parentFold) {
            
            throw Error(" Path not found "+(path.concat(name).join("/")))
            return null;
        }
        
        if(parentFold[name]) {
          
            
            var real = await readFolderData({
                filePath,
                blockId: parentFold[name]
            })
            return real;
        } else {
            throw Error("Path of child not found "+path
                .concat(name).join("/"))
        }
                
    
        
    } else {
      
        
        return null;
    }
    
    
}

async function readFolderData({
    filePath,
    blockId
}) {
    var subFolder = await readBlock({
        filePath,
        blockId,
                       
    })
    
    var data = subFolder.data;
    if(await awtsmoosJSON.isAwtsmoosObject(data)) {
        var j = await awtsmoosJSON.deserializeBinary(data);
       
        return j; 
    } else return null
}

async function getCurrentFolder({
    filePath,
    path
    
    
}) {
    var curFolder = await readFolder({
        filePath,
        path: "/",
        withValues:true
    })
    
    
    var curParentFolder = 1;
    var i  = 0;
    
    for(var segment of path) {
        if(curFolder?.[segment]) {
            curParentFolder = curFolder[segment];
            if(!curParentFolder) {
                
                
                return null;
            }
            var subFolder = await readBlock({
                filePath,
                blockId: curParentFolder,
                
            })
            
            var data = subFolder.data;
            if(await awtsmoosJSON.isAwtsmoosObject(data)) {
                var j = await awtsmoosJSON.deserializeBinary(data);
                curFolder = j;
            } else {
             
                return curParentFolder;
                throw Error("Not valid data "+segment)
                return null;
               //  return curParentFolder;
              //  return curFolder;
             //   
             //   return null;
    
            }
    
        } else {
        
              throw Error("Folder doesnt exist " +segment)
            console.log("REturning null",curFolder,segment,path)
            //return null
        }
        i++;
    }
  
    
    return curParentFolder;
}

// Recursively create a folder in the virtual file system.
// 'path' is the folder path in which to create a new folder named 'name'.
// For example, if path is "/hi/there" and name is "wow", then "wow" is created inside folder "there".
// Missing intermediate folders are created along the way.
async function makeFolder({
    filePath,
    path,
    name
}) {
    path = normalizePath(path);
    if(!path) return null;
    if(!name) {
        name = path.pop();
    }
    if(!name) {
        throw Error("No name given," + path.join("/"))
    }
    
    
//	console.log("Making",path,name)

    // If path is empty, then we're writing directly to root.
    if (!path.length) {
        
        await writeAtNextFreeBlock({
            filePath,
            parentFolderId: 1,
            folderName: "root",
            name
        });
        return;
    }
    
    
    var parentFolderToWriteTo =  await getCurrentFolder({
        filePath,
        path
        
    })  
  
    if(parentFolderToWriteTo) {
        /*var getFolder = await readFolderData({
            filePath,
            blockID: parentFolderToWriteTo
        })*/

            
        var parentFolderName = path?.[path.length-1] || "root";
        var wr = await writeAtNextFreeBlock({
            filePath,
            parentFolderId: parentFolderToWriteTo,
            folderName: parentFolderName,
            name
        });
        
        return wr;
    } else {
        return null;
    }
    
}

async function deleteFolder({
    filePath/*the database file handle*/,
    path,/*path of (emulated) folder to delete minus the name*/
    name/*name of folder. if null defaults to last
        element of path*/
}) {
    path = normalizePath(path);//makes array out of path str
    if(!name) {
        name = path.pop();
    }
    /**
     * to delete an entry:
     * var folderBlock = await readBlock({
     * 	filePath,
     * 	blockId,/*in our case the startting block* /
     * //opitional:set metadata=true
     * to just get metadata like type etc.
     * })
     * 
     * can use folderBlock.metadata.type
     * 0 is folder 1 is file;
     * 
     * var del = await deleteEntry({
            filePath,
            blockId: folderId,
            superBlock,
            allBlockIDs: folderBlock
                .allBlockIDs
        });


        but in this function it need sto read the
        folder like 

        await readFolder({
            filePath,
            path: parentPath
                .join("/"),
            withValues: true
        });

        if with Values then it returns an object
        with the keys being its children
        (files / folders) and the values
        being the block IDs where they start


        so in our case we need to recursively 
        go through each of the children of the folder
        and read the block of it with just metadata.
        if its a folder, then first get all of its
        data (with readBlock again without metadata) 
        then call deleteEntry on the folder.
        then loop through its hcildren and recursively
        do it.

        If it's a .metadata.type == 1 (file) then
        just deleteEntry on it
     */

    // Invoke the ancient function to read the parent's folder listing, drawing forth its hidden children.
    const parentFolder = await readFolder({
        filePath,
        path: parentPath.join("/"),
        withValues: true
    });
    
    // Seek the folder's block ID among the parent's children—a whisper in the dark.
    const folderBlockID = parentFolder[name];
    if (folderBlockID === undefined) {
        throw new Error("Folder not found: " + name);
    }
    
    // Delve into the folder’s inner sanctum to unveil its spectral contents.
    const folderContents = await readFolder({
        filePath,
        path: [...parentPath, name].join("/"),
        withValues: true
    });
    
    // For every child—every fragile memory and digital echo—we invoke the recursive ritual.
    for (const child in folderContents) {
        const childBlockID = folderContents[child];
        
        // Read the metadata, the lifeblood that reveals whether the child is a folder of hidden realms or a mere file.
        const childBlock = await readBlock({
            filePath,
            blockId: childBlockID,
            metadata: true
        });
        
        if (childBlock.metadata.type === 0) { // A folder pulsating with untold secrets.
            await deleteFolder({
                filePath,
                path: [...parentPath, name, child],
                name: child
            });
        } else if (childBlock.metadata.type === 1) { // A file—a solitary memory in the void.
            const childBlockFull = await readBlock({
                filePath,
                blockId: childBlockID,
                metadata: false
            });
            await deleteEntry({
                filePath,
                blockId: childBlockID,
                allBlockIDs: childBlockFull.allBlockIDs
            });
        }
    }
    
    // At last, when the children have been reduced to mere echoes, delete the folder itself.
    const fullFolderBlock = await readBlock({ filePath, blockId: folderBlockID });
    await deleteEntry({
        filePath,
        blockId: folderBlockID,
        allBlockIDs: fullFolderBlock.allBlockIDs
    });
}

// Recursively create a file in the virtual file system.
// 'path' is the folder path in which to create the file.
// For example, if path is "/hi/there" and name is "file.txt", then the file is created inside folder "there".
// Missing intermediate folders are created along the way.
async function makeFile({
    filePath,
    path = null,
    name,
    data = ""
} = {}) {
    path = normalizePath(path);
    if(!name) {
        name = path.pop();
    }
    if(path == null) {
        return null;
    }

    //console.log("MayKing",path,name)
    var parentId = await getCurrentFolder({
        filePath, path
    });
    
    


    // Create the file in the final folder.
    
    if(!parentId) {
        console.log("NO folder",path,name)
        throw Error("Folder doesn't exist"
        )
    }
    
    var isCur = await readFolder({
        filePath,
        path: path.join("/"),
        withValues: true
    });
    
 
    
    //console.log("READING",isCur,path,name,parentId)
   /*if(isCur && isCur[name]) {
    //	console.log("EXISTS",path,name);
        var del = await deleteFile({
            filePath,
            path,
            name
        })
        console.log("Del",del,path,name)
    }*/
   var parentFolderName = path.length ? 
    path?.[path.length - 1] : "root"
    var wr = await writeAtNextFreeBlock({
        filePath,
        parentFolderId: parentId,
        folderName: parentFolderName,
        name,
        data,
        type: "file"
    });
    
}

// Reads a file from the virtual file system.
// The file is looked up by traversing the folder structure specified by 'path',
// and then finding the file with the given 'name' in that folder.
async function readFile({
    filePath,
    path = null,
    name,
    isString=true
} = {}) {
    path = normalizePath(path);
    if(!name) {
        name = path.pop();
    }
    if (
        path === null ||
        typeof name !== "string"
    )
        return null;
    
    // Get the folder (with its children mapping) where the file should reside.
    let folder = await readFolder({
        filePath,
        path: path.join(
            "/"
        ),
        withValues: true
    });
    if (!folder || !(name in
            folder
    )
    ) return null;
    console.log("Read folder",folder)
    let fileBlockId = folder[name];
    let block = await readBlock({
        filePath,
        blockId: fileBlockId,
        metadata: false
    });

    
    return isString ? block.data.toString()
        :block.data;
}

async function deleteFile({
    filePath,
    path,
    name
}) {
    path = normalizePath(path);
    if(!name) {
        name = path.pop();
    }
    if (
        path === null ||
        typeof name !== "string"
    )
        return null;
    
    // Get the folder (with its children mapping) where the file should reside.
    let folder = await readFolder({
        filePath,
        path: path.join(
            "/"
        ),
        withValues: true
    });
    if (!folder || !(name in
            folder
    )
    ) return null;
    let fileBlockId = folder[name];
    const childBlockFull = await readBlock({
        filePath,
        blockId: fileBlockId,
        metadata: false
    });
    var blocks = childBlockFull.allBlockIDs;
    if(!blocks.length) {
        blocks.push(fileBlockId)
    }
    return await deleteEntry({
        filePath,
        blockId: fileBlockId,
        allBlockIDs: blocks
    });
}

async function stat({
    filePath,
    path,
    name
}) {
    
    path = normalizePath(path);

    if(!name) {
        name = path?.pop?.();
    }
    if (
        path === null ||
        typeof name !== "string"
    ) {
        console.trace(path, name)
        throw Error("No name provided")
    }

    let folder = await readFolder({
        filePath,
        path: path.join(
            "/"
        ),
        withValues:true
    });
    if(folder === null) {
        console.log("HAS NU:L",path);
        throw Error("Not found")
    }
    var keys = Object.keys(folder);
    
    if (!folder || !(name in
            folder
        )
    ) throw Error ("Not found file");
    let entryBlockId = folder[name];
    var entryMeta = await readBlock({
        filePath,
        blockId: entryBlockId,
        metadata:true
    });
    var type;

    if(!entryMeta.metadata) {
        type = entryMeta.type == 0 ?
        "folder" : "file";
        
    } else
    type = entryMeta.metadata.type == 0 ?
        "folder" : "file";
    return {
        type,
        isDirectory() {
            return type == "folder"
        }
    };
}

module.exports = {
    initializeFileSystem,
    setupFilesystem: initializeFileSystem,

    
    makeFolder,
	makeFile,
	readFolder,
	readFile,
    readBlock,

	deleteFile,
	deleteFolder,

    getSuperBlock,
	stat
}