//B"H
//Blessed is He
//Boruch Hashem


/**
 * Reads files and folders from an alias file system.
 * Split sibling of fileSystem.js (verbatim relocation).
 */

var { sp } = require("./_awtsmoos.constants.js");
var { er } = require("./general.js");

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

module.exports = {
	readFile,
	readFolder
};
