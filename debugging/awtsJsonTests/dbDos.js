//B"H
var DosDB = require("../../ayzarim/DosDB/index.js");
(async () => {


    var db = new DosDB("awtsDb");
    var red = await db.read("pkp");
    console.log("RED,red",red)
    await db.write("/wow", ["asdf","qwet"])
    var r = await db.read("/wow");
    console.log("ARray",r)
    await db.write("/well",{
        
        BH: "Hi",
        there: {
            well: 2,
            wow: "asdfg",
            nest: {
                cool: 2,
                lol: [
                    {ok: 23},
                    {we: "asdf"},
                    232,
                    'asdfwafwa'
                ]
            }
        }
    })

    g = await db.read("well")
    var mapt = await db.read("well", {
        propertyMap:{
            there: {
                nest: {
                    lol: 2
                }
            }
        }
    })
    var ar =await db.syncKeyInArray("pkp", "aszd-"+Date.now())
    console.log(g,mapt,ar);
})();
