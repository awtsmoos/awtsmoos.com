//B"H
//Blessed is He
//Boruch Hashem
/**
 * Heichel editor sort helper + editor list, split verbatim from heichel.js.
 */
var { sp } = require("./_awtsmoos.constants.js");
var { myOpts } = require("./general.js");
function sortStringsAscCaseInsensitive(arr) {
  return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

async function getHeichelEditors({
    $i,
    heichelId
}) {
    var opts = myOpts($i)
    try {
        var ar = await $i.db.get(`${
            sp
        }/heichelos/${
            heichelId
        }/editors`, opts) || [];
		return sortStringsAscCaseInsensitive(ar);
    } catch(e) {

    }
}
module.exports = { sortStringsAscCaseInsensitive, getHeichelEditors };
