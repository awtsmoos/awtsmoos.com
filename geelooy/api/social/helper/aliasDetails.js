//B"H
//Blessed is He
//Boruch Hashem
/**
 * Alias details by request method, split verbatim from alias.js.
 */
var { er, sortArray } = require("./general.js");
var { getDetailedAliasesByArray } = require("./aliasDetail.js");
var { getAliasIDs } = require("./aliasIds.js");
var { memoizedRead } = require("./profile/readCache.js");
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
		// B"H 2026-11-20 (profile data-layer fix): this GET is the
		// profile dashboard's boot gate — it assembles every alias's
		// detail record (1-2 store reads per alias, ~40 aliases) and
		// the dashboard hard-failed whenever it ran long on a loaded
		// box. Memoized per user for the profile read TTL (the route
		// is login-gated, so userID is always a real id here) — see
		// profile/readCache.js. The POST branch takes an explicit id
		// list and stays unmemoized.
		return memoizedRead("aliasDetails:" + userID, async () => {
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
		});
	}
	
	
}
module.exports = { getAliasesDetails };
