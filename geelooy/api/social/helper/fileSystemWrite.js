//B"H
//Blessed is He
//Boruch Hashem


/**
 * Writes files into an alias file system, with the alias size check.
 * Split sibling of fileSystem.js (verbatim relocation).
 */

var { sp } = require("./_awtsmoos.constants.js");
var { verifyAlias } = require("./alias.js");
var { er } = require("./general.js");

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

module.exports = {
	makeFile
};
