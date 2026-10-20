//B"H
//Blessed is He
//Boruch Hashem
/**
 * Alias ownership verification, split verbatim from alias.js.
 */
var { myOpts } = require("./general.js");
async function verifyAlias({aliasId, $i, userid}) {
    
    return await $i.db.get(
     
      `/users/${userid}/aliases/${aliasId}`, myOpts($i)
    );
    /*
    if(!aliases || !Array.isArray(aliases)) 
      return false;
  
    
    var hasIt = aliases.includes(aliasId);
    
    return hasIt;*/
  }

/**
 * @method verifyAliasOwnership 
 * @param {string} aliasId 
 * @param {Object} $i 
 * @param {string} userid 
 * @returns 
 */
async function verifyAliasOwnership(aliasId, $i, userid) {
    try {
      // Fetch the alias $i using alias ID
      var alias$i = await $i.db.get(`/users/${userid}/aliases/${aliasId}`,myOpts($i));
  
      // If alias $i exists and it belongs to the current us return true
      if (alias$i) {
        return alias$i;
      }
    } catch (error) {
      console.error("Failed to verify alias ownership", error);
    }
  
    // In all other cases (alias not found, or doesn't belong to user), return false
    return false;
  }
module.exports = { verifyAlias, verifyAliasOwnership };
