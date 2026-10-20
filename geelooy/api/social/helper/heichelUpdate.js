//B"H
//Blessed is He
//Boruch Hashem
/**
 * Update a heichel, split verbatim from heichel.js (blank lines dropped to fit cap).
 */
var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er } = require("./general.js");
var { verifyHeichelAuthority } = require("./heichelAuthority.js");
async function updateHeichel({
    $i,
    vars
}) {
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }
    // Verify ownership or permission to rename
    // (add your verification logic here)
    var heichelId = $i.$_PUT.heichelId ||
                    $i.$_PUT.id || vars.heichel;
    var newName = $i.$_PUT.newName || $i.$_PUT.name ||$i.$_PUT.heichelName;
    var newDescription = $i.$_PUT.newDescription ||
        $i.$_PUT.description;
    var dayuh = $i.$_PUT.dayuh
    var aliasId = vars.alias || $i.$_PUT.aliasId || $i.$_POST?.aliasId || $i.$_GET?.aliasId;
    var ver = await verifyHeichelAuthority({
        $i,
        heichelId,
        aliasId
    });
    if(!ver) {
        return er({
            code: "NO_AUTH",
            heichelId,
            aliasId
        })
    }
    if (
        newName &&
        newName.length > 50
    ) {
        return er({
            message:"Invalid new name",
            code:"INV_NAME_LNGTH",
            proper: {
                name: 50
            }
        });
    }
    if (newDescription && newDescription.length > 3650) {
        return er({
            message:"Description too long",
            code:"INV_DESC_LNGTH",
            proper: {
                name: 3650
            }
        })
    }
    try {
        // Fetch the existing data
        var heichelData = await $i.db.get(sp + `/heichelos/${heichelId}/info`);
        if(!heichelData) {
            return er({
                code: "NO_HEICHEL",
                message:"That heichel doesn't exist",
                detail: heichelId
            })
        }
        var modifiedFields = {
            "name": false,
            "description": false,
	     dayuh: false
        }
        // Update the name in the existing data
        if (newName) {
            heichelData.name = newName;
            modifiedFields.name = true;
        }
        if (newDescription) {
            heichelData.description = newDescription;
            modifiedFields.description = true
        }
       if(dayuh) {
	       var hd=heichelData.dayuh;
	       if(typeof(dayuh)=="object"&&hd&&typeof(hd)=="object"){
		       Object.assign(hd, dayuh)
	       } else {
		       heichelData.dayuh=dayuh;
	       }
	       modifiedFields.dayuh=true;
       }
        // Write the updated data back to the database
        await $i.db.write(sp + `/heichelos/${heichelId}/info`, heichelData);
        return {
            message: "Heichel renamed successfully",
            newName,
            modifiedFields
        };
    } catch (error) {
        console.error("Failed to rename heichel", error);
        return er({
            code:"FAILED",
            message: "Failed to rename heichel"
        });
    }
}
module.exports = { updateHeichel };
