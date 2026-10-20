//B"H
//Blessed is He
//Boruch Hashem


/**
 * Deletes entries from an alias file system.
 * Split sibling of fileSystem.js (verbatim relocation).
 */

var { sp } = require("./_awtsmoos.constants.js");
var { verifyAlias } = require("./alias.js");
var { er } = require("./general.js");

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

module.exports = {
	deleteEntry
};
