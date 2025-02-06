//B"H

console.log('B"H\n')
var os = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryOS.js");
(async () => {

/*
var osf = await os.writeBytesToFile("../awts.txt",0, `B"H
    Hi`)

    var rd = await os.readBytesFromFile("../awts.txt", 0, {
        aw: "uint8"
    });*/
    var s = await os.setupEmptyFilesystem("../awts.awtsmoosFs")
    var b = await os.readBlock({
        file: "../awts.awtsmoosFs",
        blockId: 1
    });

    console.log(b)
    var fold = await os.readFolder({
        file: "../awts.awtsmoosFs",
        path: "/"
    })
    console.log(fold,55);

    var fold = await os.makeFile({
        file: "../awts.awtsmoosFs",
        path: "/",
        name: "wow2.js",
        data: `//B"H
        // LOL nice to meet u`
    })
    var fold = await os.readFolder({
        file: "../awts.awtsmoosFs",
        path: "/"
    })
    console.log(fold,5252);
    console.log(fold)
})()