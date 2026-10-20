//B"H
//Blessed is He
//Boruch Hashem


/**
 * Moves and copies entries in an alias file system.
 * Split sibling of fileSystem.js (verbatim relocation).
 */

var { sp } = require("./_awtsmoos.constants.js");
var { verifyAlias } = require("./alias.js");
var { er } = require("./general.js");

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

module.exports = {
	moveEntry,
	copyEntry
};
