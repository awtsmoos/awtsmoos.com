//B"H

var {
    NO_LOGIN,
    NO_PERMISSION,
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
    readFolder
};

async function makeFile({$i}) {
    const { aliasId, path, content } = $i.$_POST;
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
    const userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    const isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    // Check if the alias exceeds 10MB limit
    const currentSize = await checkAliasSize({$i, aliasId});
    const newFileSize = Buffer.byteLength(content, 'utf8');
    if (currentSize + newFileSize > 10 * 1024 * 1024) {
        return er({ message: "File size limit exceeded", code: "FILE_SIZE_LIMIT" });
    }

    // Write the file to the alias's file system
    const filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    await $i.db.write(filePath, { content });

    return { success: true };
}

async function readFile({$i}) {
    let { aliasId, path } = $i.$_POST;
    if (!path) path = $i.$_GET.path;

    // Ensure the 'path' exists in POST or GET
    if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    const userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    const isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    // Read the file from the alias's file system
    const filePath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    const file = await $i.db.read(filePath);
   /* if (!file) return er({ message: "File not found", code: "FILE_NOT_FOUND" });
*/
    return  file.content || "";
}

async function makeFolder({$i}) {
    const { aliasId, path } = $i.$_POST;

    // Ensure the 'path' exists in POST or GET
    if (!path) {
        path = $i.$_GET.path;
    }
    if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    const userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    const isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    // Write the folder to the alias's file system
    const folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    await $i.db.write(folderPath);

    return { success: true };
}

async function readFolder({$i}) {
    let { aliasId, path } = $i.$_POST;
    if (!path) path = $i.$_GET.path;

    // Ensure the 'path' exists in POST or GET
    if (!path) return er({ message: "Path parameter missing", code: "PATH_MISSING" });

    // Ensure the user is logged in and has permission for alias
    const userid = $i?.request?.user?.info?.userId;
    if (!userid) return er({ message: "User not logged in", code: "USER_NOT_LOGGED_IN" });

    const isAuthorized = await verifyAlias({$i, aliasId, userid });
    if (!isAuthorized) return er({ message: "Unauthorized", code: "UNAUTHORIZED" });

    // Read the contents of the folder in the alias's file system
    const folderPath = `${sp}/aliases/${aliasId}/fileSystem/${path}`;
    try {
        const folderContents = await $i.db.read(folderPath, {
            filesAndFoldersDifferent: true
        });
        /*if (!folderContents) return er({ message: "Folder not found", code: "FOLDER_NOT_FOUND" });*/

        return folderContents || [];  // List files and folders
    } catch(e) {
        return er({ message: "System Error", code: "SYSTEM", details:e.stack });
    }
}

// Helper to check total size for alias file system
async function checkAliasSize({$i, aliasId}) {
    const aliasDir = `${sp}/aliases/${aliasId}/fileSystem/`;
    const files = await $i.db.read(aliasDir);
    let totalSize = 0;

    // Calculate total file size
    for (let file in files) {
        totalSize += Buffer.byteLength(files[file].content, 'utf8');
    }

    return totalSize;
}
