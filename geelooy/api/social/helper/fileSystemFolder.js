//B"H
//Blessed is He
//Boruch Hashem


/**
 * Creates and renames folders in an alias file system.
 * Split sibling of fileSystem.js (verbatim relocation).
 */

var { sp } = require("./_awtsmoos.constants.js");
var { verifyAlias } = require("./alias.js");
var { er } = require("./general.js");

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

module.exports = {
	makeFolder,
	renameFolder
};
