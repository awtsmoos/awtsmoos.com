//B"H
//Blessed is He
//Boruch Hashem
/**
 * Update an alias, split verbatim from alias.js (blank lines dropped to fit cap).
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er, myOpts } = require("./general.js");
var { verifyAliasOwnership } = require("./aliasVerify.js");
async function updateAlias({
	$i,
	aliasId,
	userid
}) {
	var aliasId = aliasId || $i.$_PUT.aliasId;
	var inp = $i.$_PUT.inputId;
	var newAliasName = $i.$_PUT.newAliasName ||
		$i.$_PUT.aliasName || 
		$i.$_PUT.name;
	var desc = $i.$_PUT.description || 
		$i.$_PUT.newDescription;
	var avatarUrl = $i.$_PUT.avatarUrl || $i.$_PUT.newAvatarUrl;
	var coverUrl = $i.$_PUT.coverUrl || $i.$_PUT.newCoverUrl || $i.$_PUT.headerUrl;
	if (!aliasId) {
		return er({
			message: "Alias ID or new alias name not provided",
			detail: {
				aliasId,
				newAliasName
			}
		});
	}
	var isVerified = await verifyAliasOwnership(
		aliasId,
		$i,
		userid
	);
	if (!isVerified) {
		return er({
			message: "You don't have permission to modify this alias."
		});
	}
	if(newAliasName) {
		if (newAliasName.length > 50) {
			return er({
				message:"Invalid new alias name",
				proper:50
			});
		}
	}
	if(
		desc && typeof(desc) == "string"
	) {
		if(
			desc.length > 5784
		) {
			return er({
				message: "Too long description",
				code: "DESC_TOO_LONG"
			})
		}
	}
	try {
		// Fetch the existing alias data
		var aliasData = await $i.db.get(sp + `/aliases/${aliasId}/info`,myOpts($i));
		if (!aliasData) {
			return er("Alias not found");
		}
		if(newAliasName)
			// Update the alias name in the existing data
			aliasData.name = newAliasName;
		var aliasUserData = {aliasId};
		if(newAliasName) {
			aliasUserData.name = newAliasName;
		}
		if(desc) {
			aliasUserData.description = desc;
		}
		if(avatarUrl && typeof avatarUrl === 'string' && avatarUrl.length < 2000) {
			aliasUserData.avatarUrl = avatarUrl;
		}
		if(coverUrl && typeof coverUrl === 'string' && coverUrl.length < 2000) {
			aliasUserData.coverUrl = coverUrl;
		}
		// Write the updated data back without destroying public owner metadata.
		var publicAliasData = {
			...aliasData,
			...(newAliasName ? { name: newAliasName } : {}),
			...(desc ? { description: desc } : {}),
			...(avatarUrl ? { avatarUrl } : {}),
			...(coverUrl ? { coverUrl } : {})
		};
		await $i.db.write(sp + `/aliases/${aliasId}/info`, publicAliasData);
		// Also update the alias name in user's aliases list
		await $i.db.write(
			`/users/${userid}/aliases/${aliasId}`, 
			aliasUserData
		);
		return { message: "Alias edited successfully", newAliasName, code:"ALIAS_EDIT_GOOD" };
	} catch (error) {
		return er("Failed to edit alias");
	}
}
module.exports = { updateAlias };
