//B"H
//Blessed is He
//Boruch Hashem


/**
 * Reads and deletes counters.
 * Split sibling of counter.js (verbatim relocation).
 */

var { counterPath, er, loggedIn } = require("./counterCore.js");

async function deleteCounter({
    $i,
    userid
}) {
    return true;
}

async function getCounter({
    counterID,
    $i
}) {
    var c = await $i.db.get(
        `${counterPath}/counters/${
            counterID
        }/info`
    );
    if(!c) {
        return er({
            code: "NO_COUNTER",
            message: "This counter was not found!",
            details: {counterID}
        });
    }
    return c;
}

async function getCounters({
    $i,
    userid
}) {
    if(!loggedIn($i)) {
        return er({
            code: "NO_LOGIN",
            message: "You're not logged in@!@!"
        });
    }
    var counterIDs = await $i.db.get(
        `/users/${
            userid
        }/counters`
    );
    if(!counterIDs) return [];
    return counterIDs;
}

module.exports = {
	deleteCounter,
	getCounter,
	getCounters
};
