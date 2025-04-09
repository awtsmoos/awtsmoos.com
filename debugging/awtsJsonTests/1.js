//B"H

var awtsmoosBinary = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

var baseObj = 
   
    
   {
    ok:"hi",
    oykay: {doykay: "asdf", well:" indeed", yes: "! ! ! cool ! !"},
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

]]}
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

var des = awtsmoosBinary.deserializeBinary(ser);

var start = Date.now();

//var f = awtsmoosBinary.getValueByKey(ser, "asdf")

var keys = awtsmoosBinary.getKeysFromBinary(ser);

var meta = awtsmoosBinary.getMetadataByKey(ser, "ok")
var mapt = awtsmoosBinary.mapObject(ser, {
    asdf: true,
    ok: {
        includes: "h"
    },
    oykay: {
        well: true,
        yes: {
            includes:"!"
        }
    }
})


var end = Date.now() - start

console.log(des, "DID it",keys,end,meta,mapt);