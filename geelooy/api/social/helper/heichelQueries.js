//B"H
//Blessed is He
//Boruch Hashem
/**
 * Heichel read queries, split verbatim from heichel.js.
 */
var { NO_PERMISSION, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er, myOpts } = require("./general.js");
var { verifyHeichelPermissions } = require("./heichelPermissions.js");
async function getHeichel({
	heichelId,
	$i
}) {
	var isAllowed = await verifyHeichelPermissions({
		heichelId,
		$i,
		loggedIn
	});

	if (isAllowed) {
		return await $i.db.get(
			sp +
			`/heichelos/${heichelId}/info`,
			myOpts($i)
		);
	}
	return er(NO_PERMISSION);
}

async function getHeichelos({
	$i,
	aliasId
}) {
	var options = myOpts($i)

	var heichelos = await $i.db.get(
		sp + `/aliases/${
            aliasId
        }/heichelosCreated`, options
	);

	if (!heichelos) return [];

	return heichelos;
}
module.exports = { getHeichel, getHeichelos };
