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
    renameFolder
};

async function makeFile({$i}) {
    try {
        var { aliasId, path, content } = $i.$_POST;
        if(!content) {
            content = $i.$_POST.value;
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
        var strContent = content;
        if(typeof(content) == "object") {
            try {
                strContent = JSON.stringify(content);
            } catch(e){}
        }
        try {
            var newFileSize = Buffer.byteLength(strContent, 'utf8');
            if (currentSize + newFileSize > 10 * 1024 * 1024) {
                return er({ message: "File size limit exceeded", code: "FILE_SIZE_LIMIT" });
            }
        } catch(e) {
            
        }
        path = addFolderName(path);
        // Write the file to the alias's file system
        var filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
        var wr = await $i.db.write(filePath, content);

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
 * for simpliciy all folders
 * should always end with .folder
 * extenstion then in 
 * client side we interpret it
 * so if we're recursively creating a
 * file a path/that/doesnt/exist.txt
 * then all of those parent folders
 * need to have .folder
 * added to them
 * so this function takes a path
 * like that and gives back something
 * like
 * path.folder/that.folder/doesnt.folder/exist.txt 
 * (assume last entry is a file, determined by second 
 * paramer, if not then assume all folders)
 * @param {string} path 
 */
function addFolderName(path, lastIsFile = true) {
  const parts = path.split('/');

  // Check if the path has any parent folders
  if (parts.length > 1) { 
    if (lastIsFile) {
      parts.slice(0, -1).forEach((part, index) => {
        if (!part.endsWith('.folder')) { 
          parts[index] += '.folder'; 
        }
      });
    } else {
      parts.forEach((part, index) => {
        if (!part.endsWith('.folder')) { 
          parts[index] += '.folder'; 
        }
      });
    }
  }

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
        path = addFolderName(path);
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

    path = addFolderName(path);
    // Read the file from the alias's file system
    var filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    var file = await $i.db.read(filePath);
   /* if (!file) return er({ message: "File not found", code: "FILE_NOT_FOUND" });
*/
    var extInd = filePath.lastIndexOf(".");
    var ext = ".js";
    if(extInd > -1) {
        ext = filePath.substring(extInd);
    }
    if(ext) {
        var mime = $i?.mimeTypes?.[ext];
        if(!mime) {
            mime = $i?.binaryMimeTypes?.[ext];
        }
        if(mime) {
            $i?.setHeader(
                "content-type",
                mime
                
            )
        }
    }
    return  file || "";
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

    path = addFolderName(path, false);
    // Write the folder to the alias's file system
    var folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    await $i.db.write(folderPath);

    return { success: true };
}

async function readFolder({$i}) {
    let { aliasId, path } = $i.$_POST;
    if (!path) path = $i.$_GET.path;

    // Ensure the 'path' exists in POST or GET
    if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    var userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    var isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    path = addFolderName(path, false);
    // Read the contents of the folder in the alias's file system
    var folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    try {
        var folderContents = await $i.db.read(folderPath, {
            pageSize:1000,
            keepJSON: true
        })
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
