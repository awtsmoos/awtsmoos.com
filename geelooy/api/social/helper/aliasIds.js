//B"H
//Blessed is He
//Boruch Hashem
/**
 * Alias id listing + generation, split verbatim from alias.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { myOpts, sortArray, generateAwtsmoosId } = require("./general.js");
   async function getAliasIDs({
	$i,
	userID

}){
	var options = myOpts($i)
			var aliases;
			try {
				aliases = await $i
				.db
				.get(
					`/users/${
						userID
					}/aliases/`,
					options
				);
				
				var ar = aliases || [];
				ar  = sortArray(ar);
				return ar;
			} catch(e) {
				return [];
			}

}

async function generateAliasId({
	$i
}) {
	return await generateAwtsmoosId({
		$i,
		nameVar:"aliasName",
		idVar: "aliasId",
		existingPath: `${sp}/aliases`,
		maxNameLength: 50,
		maxInputId: 26
	})
}
module.exports = { getAliasIDs, generateAliasId };
