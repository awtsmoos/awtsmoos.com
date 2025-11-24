//B"H
var awtsmoosBinary = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
var fs = require("fs")
//B"H
var DosDB = require("../../ayzarim/DosDB/index.js");
(async () => {


    var db = new DosDB("awtsDb");
    var t = 0;
    await db.appendToObj("delt", {
        key: "there",
        value: "cool !!"+ t++
    })
    await db.deleteEntry("delt", "there");
    await db.appendToObj("delt", {
        key: "ok",
        value:"Well"
    });
    var m  = await db.getMetadataList("delt")
    console.log("MEta",m)
})();