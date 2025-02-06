//B"H

console.log('B"H\n')
var os = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryOS.js");
(async () => {
    var pth = "../awts.awtsmoosFs"

/*
var osf = await os.writeBytesToFile("../awts.txt",0, `B"H
    Hi`)

    var rd = await os.readBytesFromFile("../awts.txt", 0, {
        aw: "uint8"
    });*/
    var s = await os.setupEmptyFilesystem("../awts.awtsmoosFs")
    var b = await os.readBlock({
        file: pth,
        blockId: 1,
        metadata:false
    });

    console.log(b,"Block 1")
    
    var file = await os.makeFile({
        file: pth,
        path: "/",
        name: "wow2.js",
        data: `//B"H
// LOL nice to meet u
// today I hope you're doing
// REALLY well indeed. Be well,
// and even better!!!!!!!!!!!!
// qwertyuiop
asdfghjkl
// 3242521466
// 1234567890
// 0987654321
// a623235hk664mnr
// dawvdfsn5n34g3
// dawqwee89776587wq
// qweqewqweqwewrqr2r1
// ][;[].][/][][.][/]'
// -021=123-1=4--00-94dsf
// gdsdsjrtnrtg`
    });



   var file2 = await os.makeFile({
        file: pth,
        path: "/",
        name: "wow3.js",
        data: `//B"H
        // LOL nice to meet u again`
    });

    var deepFolder = await os.makeFolder({
        file: pth,
        path: "/",
        name: "intense"
    });

    var file2 = await os.makeFile({
        file: pth,
        path: "/intense",
        name: "wow4.js",
        data: `//B"H
        here weare yet again!`
    });
    var fold = await os.readFolder({
        file: pth,
        path: "/",
        withValues:true
    })
    console.log(fold,55);


    var fold = await os.readFolder({
        file: pth,
        path: "/intense",
        withValues:true
    })
    console.log(fold,55);
/*
    var b = await os.readBlock({
        file: pth,
        blockId: 1
    });

    console.log(b,"Block 1")

    var b = await os.readBlock({
        file: pth,
        blockId: 2,
        metadata:false
    });

    console.log(b.data+"","Block 2 ")

    var b = await os.readBlock({
        file: pth,
        blockId: 3,
        metadata:false
    });

    console.log(b.data+"","Block 3 ")
*/
    var b = await os.readBlock({
        file: pth,
        blockId: 3,
        metadata:false
    });

    console.log(b.data+"","Block 3 read!!!!!!!!!!!!!!!!!")
    
    var redFile = await os.readFile({
        file: pth,
        path: "/",
        name: "wow2.js"
    })
    console.log("FILE",redFile)

    var redFile = await os.readFile({
        file: pth,
        path: "/",
        name: "wow3.js"
    })
    console.log("FILE",redFile)

    var redFile = await os.readFile({
        file: pth,
        path: "/intense",
        name: "wow4.js"
    })
    console.log("deeper ",redFile)
    //intense
    
})()