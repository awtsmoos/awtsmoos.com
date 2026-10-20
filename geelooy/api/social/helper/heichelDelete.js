//B"H
//Blessed is He
//Boruch Hashem
/**
 * Delete a heichel, split verbatim from heichel.js.
 */
var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er } = require("./general.js");
async function deleteHeichel({
    $i,
    
    
    aliasId,
    heichelId
}) {
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }

    // Verify ownership or permission to delete
    // (add your verification logic here)

    try {

        // Delete references in other entities such as aliases, 
        //editors, viewers, etc.
        await $i.db
        .removeElementFromArray(`${
            sp

        }/aliases/${
            aliasId
        }/heichelosCreated/`, {
            exact: {
                selfEquals: heichelId
            }
        });
        await $i.db.delete(sp + `/heichelos/${heichelId}`);

        return {
            message: "Heichel deleted successfully"
        };
    } catch (error) {
        console.error("Failed to delete heichel", error);
        return er("Failed to delete heichel");
    }
}
module.exports = { deleteHeichel };
