//B"H
//Blessed is He
//Boruch Hashem


/**
 * Creates counters.
 * Split sibling of counter.js (verbatim relocation).
 */

var { counterPath, loggedIn, er } = require("./counterCore.js");
var { getCounters } = require("./counterRead.js");

async function makeCounter({
    $i,
    userid
}) {
    if(!loggedIn($i)) {
        return er({
            code: "NO_LOGIN",
            message: "You're not logged inSADAD"
        });
    }
    var title = $i.$_POST.title;
    if(!$i.utils.verify(
        title, 50)
    ) {
        return er({
            code: "INVALID_WEBSITE_NAME",
            message: "That's not a valid website name"
        });
    }

    var existing = await getCounters({
        $i,
        userid
    });

    var newID = $i.utils.generateUniqueId(existing);

    await $i.db.write(
        `/users/${
            userid
        }/counters/${
            newID
        }/`, 
    );

    await $i.db.write(
        `${counterPath}/counters/${
            newID
        }/info`, {
            title,
            count: 0
        }
    );
    return {
        success: {
            made: {
                id: newID,
                title
            }
        }
    }
}

module.exports = {
	makeCounter
};
