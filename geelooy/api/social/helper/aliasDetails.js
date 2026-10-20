//B"H
//Blessed is He
//Boruch Hashem
/**
 * Alias details by request method, split verbatim from alias.js.
 */
var { er, sortArray } = require("./general.js");
var { getDetailedAliasesByArray } = require("./aliasDetail.js");
var { getAliasIDs } = require("./aliasIds.js");
async function getAliasesDetails({
	$i,
	sp,
	userID=null,
	aliasId,

	
}) {
	
	if ($i.request.method == "POST") {
		var aliasIds = $i.$_POST.aliasIds;
		/**
		 * formatted:
		 * aliasIds: [
		 *  
		 *    aliasIds (String)
		 * 
		 * ]
		 */
		if (!aliasIds || !Array.isArray(aliasIds)) {
			return er("Invalid input");
		}

		aliasIds = sortArray(aliasIds);
		
		var details = await 
		getDetailedAliasesByArray({
			$i,
			userID,
			sp,
			aliasIds
		});
		
		return sortArray(details);
	} else if($i.request.method == "GET") {
		var ids= await getAliasIDs({
				$i,
				userID,
				sp

			})
		ids = sortArray(ids);
		var det = await 
		getDetailedAliasesByArray({
			$i,
			userID,
			sp,
			aliasIds:ids
		});
		det = sortArray(det);
		return det;
	}
	
	
}
module.exports = { getAliasesDetails };
