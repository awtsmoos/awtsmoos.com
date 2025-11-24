//B"H
var fs = require("fs")
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
var arAy = ["asdf","fdsa"]
var serial = awts.serializeJSON(arAy);
var file = fs.writeFileSync("ar.awts",serial)
var des = awts.deserializeBinary("ar.awts")
console.log("AR",des)
// 🔥 Raw Chaos Object
const chaos = {
    deep:{
    k:8,
        p:{
            m: {
              well: "asdf",
              lol: 1234,
              asd: [
                2,3,
                {d:"as"}
              ]
            },
            k:676,
            ok: " okthere"
        }
    }
}
var buf =  awts.serializeJSON(chaos);

// 🧠 Map With Wild Includes
const filterResults = awts.mapObject(buf, {
  deep: {
    p:{
        m: {
          lol: 2,
          asd:true
        },
        k: 1
    }
  }
});
var str = JSON.stringify(filterResults,0,"\t")
console.log("🧬 Filter mapped:", filterResults,str);
