//B"H
var b = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON");
var fs = require("fs").promises;

console.log('B"H')
var ob =
    {
    wow:123,
    ok:"asdf",
    "lol":15
    /*
    fasd:[
  
    Buffer.from([0x2f,0x3c,0x4d]),
   null,
    undefined,
    true,
    "asdf",
    "wow so amazing!!!!",
    {wow: "asdf", intense: {pl:23,ay:[2,3,4]}},
    21389.5347879123,
    [2,3],
   
    {fancy: "time",ad:12325,j:[53,false,true], w:undefined},
    {d:true,g:false,k:null,w:undefined},
     false,
    {g:"asd",
    ok:"dauhdaiuwddidiwdawhdiauwhdiwdiuawhdiuawhiduhawidauwidhauiwdiahdiuawhdiwhadahidawhiudhawiudhaiwudhaiwdhiaw",
        a:152341232441,
        wow: [
            214212125524,
            "asdfg",
            115512152.623242341241,
            {well:5},
            ["qwert",86],
            [
                223,
                {a:2},
                "asdfg"
            ]
        ]
    },
    {
        ok: 4,
        well: "asdf"
    },
    {a:2,
        b:52424,
        ok: {asdf:4,lol:"LOL"},
        wowz: [
            "b",
            6
        ]
    },
    {ok: [
            {f:4},
            [3,4,5]
        ]
    },
    {
        wow:4,
        cool:6,
        k:6243,
        fyk:6247,
         fk:62499,
        lol: "wow",
        what: "is",
        this: true,
        inter: {
            resting: "wow",
            cooL: "story",
            in:"deed",
            well: {
                there: 9
            }
        },
        this: [
            {is: "unexpected"},
            8,
            "well"
        ],
       well:  {
            all: "right"
        }
        
    }
]*/
}

;;
;
  
for(var i = 0; i < 5121; i++) {
    ob["wowS_"+i] = [i,i*i,i+i,i-i]
}

ob.ar = []

for(var i = 0; i < 1880; i++) {
    ob.ar.push(
       
      {
            [i]: "wow_"+(i*i)
        }
        
        
    )
}
(async () => {
    var path = "./BH_wow.awtsmoos"
  //  console.log("input obj", JSON.stringify(ob,null,"\t"))
    var ser =await b.serializeJSON(ob);
    
    
    console.log("Serialized")
    //await fs.writeFile("./wow.awts", ser);
    var deser = await b.deserializeBinary(ser);
    console.log("Did it",deser);
    /*var keys = await b.getKeysFromBinary(ser);
    console.log("keys 1",keys);
    console.log("Got",await b.getValueByKey(ser,"ok"))
   //
    //var map = b.getValuesFromBinary(ser, [...keys[0]])
    //console.log("Mapt",map)
    fs.writeFile(path,ser);
    var keys = await b.getKeysFromBinary(path);
    console.log("keys 2",keys);
    console.log("Got",await b.getValueByKey(path,"wow"))


    console.log("Mapping", await b.mapBinary(path, {
        wow: true
    }))
   /* var op = await b.mapBinary("./BH_wow.awtsmoos", {

        wow: true
    });
    console.log(op)
  
    console.log("Opneed",op)*/
})()