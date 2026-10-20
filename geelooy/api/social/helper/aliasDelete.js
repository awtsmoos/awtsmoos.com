//B"H
//Blessed is He
//Boruch Hashem
/**
 * Delete an alias, split verbatim from alias.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er, myOpts } = require("./general.js");
var { verifyAlias } = require("./aliasVerify.js");
async function deleteAlias({
	$i,
	
	
	aliasId,
	
	userid
}) {
	
	
	
	
	if (!aliasId) {
		return er("No alias ID provided");
	}
	
	var ver = await verifyAlias({aliasId, $i, userid});
	if (!ver) {
		return er("Not your alias");
	}
	
	try {
		// Delete alias from user's aliases
		await $i.db.delete(`/users/${userid}/aliases/${aliasId}`);
		
		
		// Get all heichelos associated with the alias
		var heichelos = await $i
			.db.get(sp + `/aliases/${aliasId}/heichelos`,myOpts($i));
		
		if (heichelos) {
			for (var heichelId in heichelos) {
				// Delete all heichelos data
				
				await $i.db.delete(sp + `/heichelos/${heichelId}`, true);
			}
		}
		await $i.db.delete(sp + `/aliases/${aliasId}`);
		
		return {
			message: "Alias and associated data deleted successfully",
			code: "DEL_DONE"
		};
	} catch (error) {
		console.error('Error deleting alias and associated data:', error);
		return er({error:"Error deleting alias and associated data", code: "DEL_ER"});
	}
}
module.exports = { deleteAlias };
