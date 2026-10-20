//B"H
//Blessed is He
//Boruch Hashem
/**
 * Fetch one alias, split verbatim from alias.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er } = require("./general.js");
  async function getAlias(aliasId, $i){
    
    
   
    var ail = await $i
    .db
    .get(
  
      `${sp}/aliases/${
        aliasId
      }/info`
    );

	if(!ail) {
		return er({
			message: "NO alias found",
			code: "NO_ALIAS",
			aliasId
		})
	}

	if(ail?.user) {
		delete ail.user
	}
	
	return ail;
  
  
  }
module.exports = { getAlias };
