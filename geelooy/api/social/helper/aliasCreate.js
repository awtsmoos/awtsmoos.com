//B"H
//Blessed is He
//Boruch Hashem
/**
 * Create a new alias, split verbatim from alias.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er } = require("./general.js");
var { generateAliasId } = require("./aliasIds.js");
/**
required: aliasName;
optional: 
	description
	custom id: id
**/
async function createNewAlias({
	$i, 
	userid
}) {
	
	var aliasName = $i.$_POST.aliasName;
	var desc = $i.$_POST.description;

	if (typeof aliasName !== "string" || !aliasName.trim()) {
		return er({ message: "aliasName is required", code: "NO_ALIAS_NAME" });
	}
	if (aliasName.length > 50) {
		return er({ message: "Alias name too long", code: "ALIAS_NAME_TOO_LONG", proper: 50 });
	}
	if (desc && typeof desc === "string" && desc.length > 5784) {
		return er({ message: "Too long description", code: "DESC_TOO_LONG" });
	}

	let iteration = 0;
	let unique = false;
	let aliasId = await generateAliasId({
		$i
	});
	if(aliasId) {
		if(aliasId.error) {
			return {
				error: aliasId.error,
				hi:"there",
				entire:aliasId
			}
		} else if(aliasId.aliasId)
			aliasId  = aliasId.aliasId
	}
	
	
	
	await $i.db.write(
		
		`/users/${
		userid
		}/aliases/${
		aliasId
		}`, {
				name: aliasName,
				aliasId,
				...(
					desc?{
						description: desc
					}:null
				)
			}
	);

	await $i.db.write(
		sp +
		`/aliases/${
	  aliasId
	}/info`, {
			name: aliasName,
			user: userid
		}
	);
	return { name: aliasName, aliasId };
}
module.exports = { createNewAlias };
