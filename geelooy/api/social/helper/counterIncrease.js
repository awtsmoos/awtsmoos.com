//B"H
//Blessed is He
//Boruch Hashem


/**
 * Increments a counter.
 * Split sibling of counter.js (verbatim relocation).
 */

var { counterPath, er } = require("./counterCore.js");
var { getCounter } = require("./counterRead.js");

async function increaseCount({
    counterID,
    userid,
    $i
}) {
    
    var c = await getCounter({
        counterID,
        $i
    });

    

    if(c.error) {
        return c;
    }
    var site = c.title;
    /*/*try {
    if(typeof(site) == "string" && site.length)
    $i.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );/
    } catch(e) {
    }

    /*$i.setHeader(
        "Essence", "WELL"
    )*/

    var count = c.count;
    try {
        if(typeof(count) == "string")
            count = parseInt(count);
        if(isNaN(count)) {
            count = 0;
        }
        if(!isNaN(count)) {
            count++;
        }
        c.count = count;
        await $i.db.write(
            `${counterPath}/counters/${
                counterID
            }/info`, c
        );

    } catch(e) {
        return er({
            code: "PROBLEM_COUNTING",
            message: "There was a problem counting"
        });
    }
    return count;

    

}

module.exports = {
	increaseCount
};
