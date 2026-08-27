//B"H

var {
    NO_LOGIN,
    sp
} = require("./_awtsmoos.constants.js");

var {
    verifyAlias
} = require("./alias.js");

var {
    loggedIn,
    er,
    myOpts
} = require("./general.js");

module .exports ={
    makeFile,
    readFile,
    makeFolder,
    deleteEntry,
    readFolder,
    renameFolder,
    moveEntry,
    copyEntry
};

// Handles moving files AND folders
async function moveEntry({$i}) {
    try {
        let { aliasId, oldPath, newPath } = $i.$_POST;
        
        // Basic Validation
        if (!oldPath || !newPath) {
             return er({ message: "oldPath or newPath missing", code: "ARGS_MISSING" });
        }

        // Auth Check
        var userid = $i?.request?.user?.info?.userId;
        if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });
        var isAuthorized = await verifyAlias({$i, aliasId, userid });
        if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

        // Construct full system paths
        var fullOldPath = `${sp}/aliases/${aliasId}/fileSystem/${oldPath}`;
        var fullNewPath = `${sp}/aliases/${aliasId}/fileSystem/${newPath}`;

        // Perform the Move (Rename)
        // Note: DOSDB's rename works for both files and folders usually
        await $i.db.rename(fullOldPath, fullNewPath);

        return { success: true, movedFrom: oldPath, movedTo: newPath };

    } catch(e) {
        return er({ message: "Move failed", code: "MOVE_ERROR", details: e.stack });
    }
}
async function readFile({$i}) {
    let { aliasId, path } = $i.$_POST;
    if (!path) path = $i.$_GET.path;

    // Ensure the 'path' exists in POST or GET
    if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    /*var userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    var isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });
*/


   
    var filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    if ($i.request.isAwtsmoosFileStatusRequest) {
	    var stats = await $i.db.read(filePath, {access: true});
	    
            $i?.setHeader(
                "content-type",
                "application/json"
                
            )
	   // return {dataModified: stats?.mtime?.getTime?.()};
    }
    var file = await $i.db.read(filePath);

    var extInd = filePath.lastIndexOf(".");
 
    if(extInd > -1) {
        ext = filePath.substring(extInd);
    }
    
    var mime = $i?.mimeTypes?.[ext];
    if(!mime) {
        mime = $i?.binaryMimeTypes?.[ext];
    }
    if(!mime) mime = "application/javascript";//default mime type
    if(mime) {
        $i?.setHeader(
            "content-type",
            mime
            
        )
    }
    
    return  (file) || "";
}

async function makeFile({$i}) {
    try {
        var {
	        aliasId, 
	        path, 
	        content,
	        binaryData
        } = $i.$_POST;
        if(!content) {
            content = $i.$_POST.value;
        }
        if(binaryData) {
	        content = binaryData.data;
        }
      
      
        if (!content)
            return er({ message: "Content/value parameter missing", code: "CONTENT_MISSING" });
        // Ensure the 'path' exists in POST or GET
        if (!path) {
            path = $i.$_GET.path;
        }
        if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

        // Ensure the user is logged in and has permission for alias
        var userid = $i?.request?.user?.info?.userId;
        if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });
    
        var isAuthorized = await verifyAlias({$i, aliasId, userid });
       
       
        if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

        // Check if the alias exceeds 10MB limit
        var currentSize = await checkAliasSize({$i, aliasId});
        
        var newFileSize
        var strContent = content;
        if(Buffer.isBuffer(content)) {
	        newFileSize = content.length;
        } else if(typeof(content) == "object") {
            try {
                strContent = JSON.stringify(content);
            } catch(e){}
        }
        try {
            newFileSize = Buffer.byteLength(strContent, 'utf8');
            if (currentSize + newFileSize > 10 * 1024 * 1024) {
                return er({ message: "File size limit exceeded", code: "FILE_SIZE_LIMIT" });
            }
        } catch(e) {
            return er({
                message: "Issue saving file",
                details: e.stack
            })
        }
        
        // Write the file to the alias's file system
        try {
            var filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
            
            var wr = await $i.db.write(filePath, content);

        } catch(e) {
            return er({
                message: "Couldn't write",
                details: e
            })
        }
        return { success: {
            filePath,
            path,
            aliasId,
            userid,
            wr
        } };
    } catch(e) {
        return er({ message: "System Error", code: "SYSTEM", details:e.stack });
    }
}

/**
 * for use with API
 * to read and write files

 * @param {string} path 
 */
function addFolderName(path, lastIsFile = true) {
  const parts = path.split('/');

  // Check if the path has any parent folders


  return parts.join('/');
}
async function deleteEntry({$i}) {
    try {
        var { aliasId, path } = $i.$_DELETE;
     
        // Ensure the 'path' exists in POST or GET
        if (!path) {
            path = $i.$_GET.path;
        }
        if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

        // Ensure the user is logged in and has permission for alias
        var userid = $i?.request?.user?.info?.userId;
        if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });
    
        var isAuthorized = await verifyAlias({$i, aliasId, userid });
        if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });
    
    
        // Write the file to the alias's file system
        var filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
        var deleted = await $i.db.delete(filePath);

        return { success: {
            filePath,
            path,
            aliasId,
            userid,
            deleted
        } };
    } catch(e) {
        return er({ message: "System Error", code: "SYSTEM", details:e.stack });
    }
}


async function makeFolder({$i}) {
    var { aliasId, path } = $i.$_POST;

    // Ensure the 'path' exists in POST or GET
    if (!path) {
        path = $i.$_GET.path;
    }
    if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    var userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    var isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    // Write the folder to the alias's file system
    var folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    await $i.db.write(folderPath);

    return { success: true };
}

async function readFolder({$i}) {
    let { aliasId, path } = $i.$_POST;
    if (!path) path = $i.$_GET.path;

    // Ensure the 'path' exists in POST or GET
    if (!path) path = "";
    path = path.trim()
    path = $i.path.normalize(path);
    /*
    // Ensure the user is logged in and has permission for alias
    var userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    var isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });
    */ 
    
    
    // Read the contents of the folder in the alias's file system
    var folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
   
    try {
        var folderContents = await $i.db.read(folderPath, {
            pageSize:1000,
            keepJSON: true,
            extra: true
        })
        //return {wgy:2}
        /*if (!folderContents) return er({ message: "Folder not found", code: "FOLDER_NOT_FOUND" });*/
        return folderContents || [];  // List files and folders
    } catch(e) {
        return er({ message: "System Error", code: "SYSTEM", details:e.stack });
    }
}


async function renameFolder({$i}) {
    let { aliasId, path, newPath } = $i.$_POST;
    if (!path) path = $i.$_GET.path;
    if(!newPath) {
        newPath = $i.$_GET.newPath;
    }
    // Ensure the 'path' exists in POST or GET
    if (!path || !newPath) return er({ message: "Path or newPath parameter missing", code: "PATH_NEWPATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    var userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    var isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    path = addFolderName(path, false);

    newFolderPath = addFolderName(newFolderPath, false);
    // Read the contents of the folder in the alias's file system
    var folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    var newFolderPath = `${sp}/aliases/${aliasId}/fileSystem/${newPath}`
    try {
        var rename = await $i.db.rename(
            folderPath, 
            newFolderPath
        )
        /*if (!folderContents) return er({ message: "Folder not found", code: "FOLDER_NOT_FOUND" });*/

        return {success: rename}
    } catch(e) {
        return er({ message: "System Error", code: "SYSTEM", details:e.stack });
    }
}

// Helper to check total size for alias file system
async function checkAliasSize({$i, aliasId}) {
    var aliasDir = `${sp}/aliases/${aliasId}/fileSystem/`;
    var files = await $i.db.read(aliasDir);
    let totalSize = 0;
    /*
    // Calculate total file size
    for (let file in files) {
        totalSize += Buffer.byteLength(files[file], 'utf8');
    }
    */
    return totalSize;
}


// Handles copying files AND folders
async function copyEntry({$i}) {
    try {
        let { aliasId, oldPath, newPath } = $i.$_POST;
        
        // Basic Validation
        if (!oldPath || !newPath) {
             return er({ message: "oldPath or newPath missing", code: "ARGS_MISSING" });
        }

        // Auth Check
        var userid = $i?.request?.user?.info?.userId;
        if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });
        var isAuthorized = await verifyAlias({$i, aliasId, userid });
        if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

        // Construct full system paths
        var fullOldPath = `${sp}/aliases/${aliasId}/fileSystem/${oldPath}`;
        var fullNewPath = `${sp}/aliases/${aliasId}/fileSystem/${newPath}`;

        // Perform the Copy
        var result = await $i.db.copy(fullOldPath, fullNewPath);

        if(result.error) return er(result.error);
        
        return { success: true, copiedFrom: oldPath, copiedTo: newPath };

    } catch(e) {
        return er({ message: "Copy failed", code: "COPY_ERROR", details: e.stack });
    }
}
