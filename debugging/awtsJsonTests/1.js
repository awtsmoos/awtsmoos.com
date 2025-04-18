//B"H
var awtsmoosBinary = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
var fs = require("fs")

/*
var old =            require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON-old.js");
require("fs").writeFileSync("./Ok.awts", news.serializeJSON(Object.fromEntries(Array.from({length:17}).fill(2).map((q,i)=>[i,2*i]))))
undefined
> o=news.deserializeBinary(require("fs").readFileSync("./Ok.awts"))
*/
var baseObj = {ok:2,
    jkl:[],
    pop:{},
    ok:"hi",
    oykay: {
        doykay: "asdf",
         well:" indeed",
         ar: [5,6],
          yes: "! ! ! cool ! !"
        },
    asdf: [1,2,3],
    there:2, "well": "cool",
    
    array: [
    {
    j:8123, a:123.4125152152, t:-1231244.4, g:"ok", c:undefined,
    qq:null,
    wow: [34,"okok",{o:8, kko:"ok", }],
        
    
    aww:[
        "here",
        "we",
        -123123.1212412412412412141241241,
        {
            go: "again"
        }
    ]
},
[2,3,4,"ok dow kay",
    null,
    undefined,
    -4,
    -1 * Math.pow(2, 17) ,

    3.14,
    0.75,
    12.3,
    -24.1525122419,
    ["asdf", [123,.23,.1241124124]],
    {s:3},
    {j:8}

]],
//d:Array.from({length:23546}).fill(1000).map((q,i)=>Math.pow(2, 16) + i )
}
 /*{
    hi: "there",
    how: 123,
    are: [
        {
            ok: {
                you: "ell"
            },
            pretty: "good"
        },
        5,
        "asdf",
    ]
}*/


var ser = awtsmoosBinary.serializeJSON(baseObj);

//var des = awtsmoosBinary.deserializeBinary(ser);

var pth = "debugging/awtsJsonTests/wow.awts"
  var wroyt = fs.writeFileSync(pth, ser)


var parst = awtsmoosBinary.deserializeBinary(pth)
var des = parst;

var start = Date.now();

//var f = awtsmoosBinary.getValueByKey(ser, "asdf")

var keys = awtsmoosBinary.getKeysFromBinary(pth);
var meta = awtsmoosBinary.getMetadataByKey(pth, "ok")
var mapt = awtsmoosBinary.mapObject(pth, {
    asdf: true,
    ok: {
        includes: "h"
    },
    oykay: {
        well: true,
        ar: {
            metadata:3
        },
        yes: {
            includes:"!"
        }
    }
})
console.log( "DID it",
   
    parst,
    ser,
    meta,
    mapt
    

  //  keys,end,meta,mapt
);

for(var i = 0; i < 1; i++) {

var app = awtsmoosBinary.append(pth, {
    key: //Math.random() + 
   "well",
    value: 9
})


var app = awtsmoosBinary.append(pth, {
    key: //Math.random() + 
   "okk",
    value: 29
})


console.log("appetiet",app)

console.log("l",
    awtsmoosBinary.deserializeBinary(pth))
}


for(var i = 0; i < 1; i++) {

    var app = awtsmoosBinary.append(pth, {
        key: //Math.random() + 
        "well",
        value: 5
    })
    console.log("Appendage",app)

    
}

    var by = fs.readFileSync(pth);
var redAgain = //
awtsmoosBinary.deserializeBinary(pth);


var meta = awtsmoosBinary.getMetadata(pth)
console.log("RED",redAgain, meta, by,

    
)

var otherFileD = awtsmoosBinary.deserializeBinary(pth)
console.log("Ot",otherFileD)