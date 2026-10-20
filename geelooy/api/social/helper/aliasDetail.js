//B"H
//Blessed is He
//Boruch Hashem
/**
 * Detailed alias lookups, split verbatim from alias.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er, myOpts, sortArray } = require("./general.js");
async function getDetailedAliasesByArray({
    aliasIds,
       $i,
       
       userID
   }){
	if(!Array.isArray(aliasIds)) {
		return [er({
			message: "NO IDs!?",
			aliasIds,
			userID,
			$i
		})]
	}
       return await Promise.all(
               sortArray(aliasIds.map(id => ((async (aliasId) => {
                   var detailedAlias = await 
                   getDetailedAlias({
                       
                       aliasId,
                       $i,
                       userID
                   });
                   return detailedAlias;
                   
               }))(id)))
           );
   
   }

   async function getDetailedAlias({
       aliasId,
       $i,
       userID
   }) {
       var user = userID;
       if(!userID) {
		   var pth = `${sp}/aliases/${
                       aliasId
                   }/info`
           var value = await $i
               .db
               .get(
                   pth,
		  myOpts($i)
                   
               );
			   
           if(!value) {
               return null
           }
   
           user = value.user;
       }
       if(!user) {
           return er("Couldn't find alias")
       }
       var detailedAlias = await $i
           .db
           .get(`/users/${
               user
           }/aliases/${
               aliasId
           }`, myOpts($i));
       if(!detailedAlias) return null;
       if(!detailedAlias.description) {
           detailedAlias.description = ""
       }
   
       detailedAlias.id = aliasId
       
        return detailedAlias;
   }
module.exports = { getDetailedAliasesByArray, getDetailedAlias };
