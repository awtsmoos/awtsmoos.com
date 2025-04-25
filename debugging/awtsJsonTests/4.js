//B"H

const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

// 🔥 Raw Chaos Object
const chaos = {
    deep:{
    k:8,
        p:{
            m:78,
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
        m: true,
        k: 1
    }
  }
});
console.log("🧬 Filter mapped:", filterResults);
