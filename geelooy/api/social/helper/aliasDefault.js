//B"H
//Blessed is He
//Boruch Hashem
/**
 * Default-alias get/set, split verbatim from alias.js.
 */
var { er } = require("./general.js");
var { verifyAlias } = require("./aliasVerify.js");
async function getDefaultAlias({$i, userid}) {
	var cook = $i?.request?.user?.info?.hosuhfuh?.alias
	
	if(cook) {
		return {success: cook}
	}
	return er({
		code: "NO_DEFAULT",
		error: "no default alias set",
		detail:$i.request.user
	})
}

async function setDefaultAlias({$i, userid}) {
	var alias = $i.$_POST.aliasId || $i.$_POST.alias;
	var owns = await verifyAlias({aliasId: alias, $i, userid})
	if(!owns) {
		return er({
			code: "NOT_AUTHORIZED",
			error: "You do not own that alias",
			details: alias
		})
	}
	
	
	try {
		var token = $i.makeToken(userid, {alias})
		var success = token.success
		if(!success) {
			return er({
				error: "some token error",
				details: token.error+""
			})
		}
		
		var resp = $i.setCookie("awtsmoosKey", success)
		if(resp.success)
			return {success: "you did it", details: alias}
		else {
			return er({
				error: "something went wrong",
				details: resp
			})
		}
	} catch(e) {
		return er({
			code: "cookie error",
			er:e+""
		})
	}
}
module.exports = { getDefaultAlias, setDefaultAlias };
