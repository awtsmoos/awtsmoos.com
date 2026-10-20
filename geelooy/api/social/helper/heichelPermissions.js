//B"H
//Blessed is He
//Boruch Hashem
/**
 * Heichel view-permission check, split verbatim from heichel.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er } = require("./general.js");
async function verifyHeichelPermissions({
	heichelId,
	$i,
	
	
	NO_PERMISSION,
	
	NO_LOGIN,
	userid
}) {
	var isPublic = await $i.db.get(
		sp +
		`/heichelos/${
		heichelId
	  }/public`
	);
	var isAllowed = true;

	if (!isPublic) {
		if (!loggedIn($i)) {
			return er(NO_LOGIN);
		}
		var viewers = await $i.db.get(
			sp +
			`/heichelos/${
		  heichelId
		}/viewers`
		);

		if (!viewers) return er(NO_PERMISSION);
		var myAliases = await $i.db.get(
			`/users/${
		  userid
		}/aliases`
		);

		if (!myAliases) return er(NO_PERMISSION);

		isAllowed = false;
		myAliases.forEach(q => {
			if (viewers.includes(q)) {
				isAllowed = true;
			}
		});

	}
	return isAllowed;
}
module.exports = { verifyHeichelPermissions };
