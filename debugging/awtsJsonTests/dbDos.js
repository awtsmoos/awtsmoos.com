//B"H
var DosDB = require("../../ayzarim/DosDB/index.js");
(async () => {


    var db = new DosDB("awtsDb");
 //   await db.write("asdf",{ok:2})
 var trup = await db.appendToObj("ds", {
    key: "well",
    value: true
})
console.log("true",trup)
    var app = await db.appendToObj("asdf", {
        key: "ok-"+Date.now(),
        value:"Cool "
    })
   
  // await db.write("syncer",{"awtsmoos":true})
    var syncer = await db.syncKeyToObj("syncer", "awtsmoos")
    console.log("SYNC",syncer,app, trup)
    
    var del = await db.deleteEntry("asdf", "ok-1745981757058");
    console.log("DEL",del)
    var reed = await db.read("asdf")

    console.log("Apneded",app,reed)
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
