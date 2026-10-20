//B"H
//Blessed is He
//Boruch Hashem
/**
 * Create a heichel, split verbatim from heichel.js (blank lines dropped to fit cap).
 */
var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er } = require("./general.js");
var { generateHeichelId } = require("./heichelId.js");
async function createHeichel({
    $i,
    aliasId
}) {
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }
    var name = $i.$_POST.name||$i.$_POST.heichelName;
    var description = $i.$_POST.description;
    var aliasId = aliasId || $i.$_POST.aliasId;
    var isPublic = $i.$_POST.isPublic || "yes";
    var ver = await $i.fetchAwtsmoos(
		"/api/social/aliases/"+
		aliasId+"/ownership"
	)
    if (ver.no || !ver) {
        return er("Not your alias");
    }
    if((name && name.length > 50) || (description && description.length > 365)) {
        return er({
            message: "Name or description too long. Name max: 50 char. desc: 365",
            proper: {
                name: 50,
                description: 365
            },
            code: "PARAMS__TOO_LONG"
        })
    }
    if(!description) {
        description = "";
    }
    //editing existing heichel
    var heichelId = $i.$_POST.heichelId || $i.$_POST.inputId
        || $i.$_POST.id;
    //creating new heichel
    if (!heichelId) {
        var generated = await generateHeichelId({$i})
        if(generated.error) {
            return generated
        }
        heichelId = generated.heichelId;
    }
    await $i.db.syncKeyInObj(
        sp +
        `/aliases/${
            aliasId
        }/heichelosCreated`,
        heichelId
    );
    await $i.db.write(
        sp +
        `/heichelos/${
        heichelId
        }/info`, {
            name,
            description,
            author: aliasId
        }
    );
    await $i.db.syncKeyInArray(
        sp +
        `/heichelos/${
            heichelId
            }/editors`,
            aliasId
        );
        await $i.db.syncKeyInObj(
            sp +
            `/heichelos/${
            heichelId
            }/viewers`, aliasId
        );
    if (isPublic == "yes") {
        await $i.db.write(
            sp +
            `/heichelos/${
                heichelId
            }/public`
        );
    }
    return {
        success: {
            message: "Made the new heichel",
            details: {
                name,
                description,
                author: aliasId,
                heichelId
            }
        }
    };
}
module.exports = { createHeichel };
