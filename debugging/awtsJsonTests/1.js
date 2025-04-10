//B"H
var awtsmoosBinary = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
var fs = require("fs")

/*
var old =            require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON-old.js");
require("fs").writeFileSync("./Ok.awts", news.serializeJSON(Object.fromEntries(Array.from({length:17}).fill(2).map((q,i)=>[i,2*i]))))
undefined
> o=news.deserializeBinary(require("fs").readFileSync("./Ok.awts"))
*/
var baseObj = 


   
    
   {
    wow: 
    Object.fromEntries(
    
        Array.from({length:32})
        .fill(1).map((q,i) => [256 + i * i, i + i * i])
    
    
    ),
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
//var file = fs.readFileSync("debugging/awtsJsonTests/subSeries.awtsmoosJSON")

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


var app = awtsmoosBinary.append(pth)

