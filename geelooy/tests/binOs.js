//B"H

console.log('B"H\n')
var os = require("../../ayzarim/DosDB/awtsmoosBinaryOS.js");
(async () => {

var osf = await os.writeBytesToFile("../awts.txt",0, `B"H
    Hi`)

    var rd = await os.readBytesFromFile("../awts.txt", 0, {
        aw: "uint32_t"
    });
    console.log(rd)
})()