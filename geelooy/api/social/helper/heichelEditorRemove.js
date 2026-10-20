//B"H
//Blessed is He
//Boruch Hashem
/**
 * Remove a heichel editor, split verbatim from heichel.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { er } = require("./general.js");
var { verifyHeichelAuthority } = require("./heichelAuthority.js");
var { sortStringsAscCaseInsensitive } = require("./heichelEditors.js");
async function removeHeichelEditor({
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

        var prospectAlias = $i.$_DELETE.editorAliasId;
        var pth = `${
            sp
        }/heichelos/${
            heichelId
        }/editors`
        var cur = await $i.db.get(pth);
        if(Array.isArray(cur)) {
			var ind = cur.indexOf(prospectAlias);
			if(ind > -1) {
				cur.splice(ind, 1)
			}
            cur = sortStringsAscCaseInsensitive(cur);
            var del = await $i.db.write(pth, cur);
            return {
                success: {
                    deleted: prospectAlias,
                    now: cur,
                    del
                }
            }
        } else {
            return er({
                message: "That editor doesn't exist currently in it",
                code: "NO_EDITOR",
                details: {
                    prospectAlias
                }
            })
        }


    } catch(e) {
        return er({
            message: "Issue",
            details: JSON.stringify(e)
        })
    }
}
module.exports = { removeHeichelEditor };
