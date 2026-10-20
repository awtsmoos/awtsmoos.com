//B"H
//Blessed is He
//Boruch Hashem
/**
 * Heichel authority checks, split verbatim from heichel.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
async function verifyHeichelAuthority({
	heichelId,
	aliasId,
	
	$i
}) {

	if (!heichelId || !aliasId) return false;

	var ownsAlias = await $i
		.fetchAwtsmoos(
            "/api/social/alias/" +
			aliasId + "/ownership"
        );

	if (ownsAlias.no)
		return false;

    
    
	try {
        var me = await $i.db.get(
            `${sp}/heichelos/${heichelId}/editors`
        );
        if (!Array.isArray(me)) return false;
        return me.includes(aliasId);

	} catch(e) {
        return false;
	}


	


	
}

async function verifyHeichelViewAuthority(heichelId, aliasId, $i) {
    if(!heichelId || !aliasId || !$i) return false;
    var viewers = await db.get(
      sp+
      `/heichelos/${
        heichelId
      }/viewers`
    );
  
    if(!viewers) return false;
    return viewers.includes(aliasId);
  }
module.exports = { verifyHeichelAuthority, verifyHeichelViewAuthority };
