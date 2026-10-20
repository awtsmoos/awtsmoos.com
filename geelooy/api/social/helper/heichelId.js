//B"H
//Blessed is He
//Boruch Hashem
/**
 * Heichel id generation/validation, split verbatim from heichel.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er } = require("./general.js");
async function generateHeichelId({
    $i
}) {

	var inputId = $i.$_POST.inputId || $i.$_POST.id || $i.$_POST.heichelId;
	var heichelName = $i.$_POST.heichelName || $i.$_POST.name;
	if(!inputId && !heichelName) {
		return er({
			message: "no parameters provided. Need either inputId or heichelName",
			code: "NO_PARAMS",
			given: $i.$_POST
		})
	}

	if(inputId) {
		if(inputId.length > 26) {
			return er({
				message: "Invalid heichel id length. Max: 26 characters",
				code:"INVALID_ID_LENGTH",
				proper: 26
			})
		}
		
		try {
			if(!$i.utils.verifyStrict({
				inputString: inputId
			})) {
				return er({
					message: "Invalid id. need to have only "
					+"English letters or numbers, hebrew letters, "
					+" _ or $, and no spaces"
					,
					proper:`a-zA-Z0-9_$;`,
					code: "INVALID_ID_FORMAT"
				})
			}
		} catch(e) {
			return er({
				message:"Problem verifying id",
				code: "PROB_ID_VER",
				details: e.toString()
			})
		}
	}
	
	if(heichelName) {
		if (
			heichelName.length > 50
		) {
			return er({
				message: "Your heichel name is too long (max: 50 char)",
				code: "INV_NAME_LNGTH",
				proper: 50
			});
		}
	}
	var heichelId;

	try {
		heichelId = inputId || $i.utils.generateId(heichelName, false, 0);
	} catch(e) {
		return er({
			message: "Problem making the id",
			code: "PROBLEM_MAKING",
			detail:e+""
		})
	}
	if(!heichelId) {
		return er({
			message: "Problem making the id",
			code: "PROBLEM_MAKING",
			detail: {
				heichelId, heichelName
			}
		})
	} 

	try {
		var existingAlias = await $i
		.db.get(`${sp}/heichelos/${
			heichelId
		}`);
		
		if (existingAlias) {
			return er({
				message: "That heichel already exists",
				code: "ALREADY_EXISTS"
			})
		}
	} catch(e) {
		return er({
			message: "Problem searching",
			code: "PROB_SEARCH",
			detail:heichelId+""
		})
	}

	return {heichelId};
}
module.exports = { generateHeichelId };
