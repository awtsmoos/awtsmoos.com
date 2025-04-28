//B"H

const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

// 🔥 Raw Chaos Object
const chaos = {
    deep:{
    k:8,
        p:{
            m: {
              well: "asdf",
              lol: 1234
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
          lol: 2
        },
        k: 1
    }
  }
});
var str = JSON.stringify(filterResults,0,"\t")
console.log("🧬 Filter mapped:", filterResults,str);
