//B"H
//Blessed is He
//Boruch Hashem
/**
 * Add a heichel editor, split verbatim from heichel.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er } = require("./general.js");
var { verifyHeichelAuthority } = require("./heichelAuthority.js");
var { sortStringsAscCaseInsensitive } = require("./heichelEditors.js");
async function addHeichelEditor({
    $i,
    heichelId
}) {
    try {
        var aliasId = $i.$_DELETE?.aliasId || $i.$_POST?.aliasId;
        var ver = await verifyHeichelAuthority({
            $i,
            heichelId,
            aliasId
        });
    
        if(!ver) {
            return er({
                code: "NO_AUTH",
                heichelId,
                aliasId
            })
        }

        var cur = await $i.db.get(`${
            sp
        }/heichelos/${
            heichelId
        }/editors`) || [];

        var prospectAlias = $i.$_POST.editorAliasId;
		if(Array.isArray(cur)) {
			cur.push(prospectAlias);
			
			cur = sortStringsAscCaseInsensitive(cur)
		}
       
        var wr = await $i.db.write(`${
            sp
        }/heichelos/${
            heichelId
        }/editors`, cur);
        return {
            success: {
                editors: cur,
                new: prospectAlias,
                wr
            }
        }

    } catch(e) {
        return er({
            message: "Issue",
            details: (e.stack)
        })
    }
}
module.exports = { addHeichelEditor };
