// B"H

console.log('B"H\n');
var awtsJ = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON.js");
var AwtsmoosFS = require("../../ayzarim/DosDB/awtsmoosFs/index.js");

(async () => {
    var pth = "../awts.awtsmoosFs";
    var os = new AwtsmoosFS(pth);
   
    var s = await os.setupFilesystem(pth);
    var fold = await os.mkdir("/wow")

    await os.mkdir("/wow/qwerty")
    await os.mkdir("/qwert");
  
    await os.makeFile({
      path: "/qwert/LOL.txt",
      data:`B"H
      
      Ok. Now we're squaking.`
    })

    await os.makeFile({
      path: "/qwert/MT.txt",
      data:Buffer.from(`a`)
    });

    await os.makeFile({
      path: "/qwert/awtsOb",
      data: awtsJ.serializeJSON({
        well: "hello",
        ar: Array.from({
          length: 2400
        }).map((w,i) => [i * i, i + i])
      })
    })


    await os.mkdir("/okWell1")
    await os.mkdir("/wow/well")
    await os.mkdir("/qwerty")

    await os.mkdir("/why")
    await os.mkdir("/why/me");
    await os.mkdir("/why/me/today");
    await os.mkdir("/why/me/today/again");
  
    await os.mkdir("/asdfg")

    await os.makeFile({
      path: "/asdfg/weil.txt",
      data:`B"H
      `+ (
        Array.from({
          length:12000
        }).map((q,i) => i)
        .join("-")
      )
    })
    await os.mkdir("/asdfg/lol")
    await os.mkdir("/asdfg/lol/ok")

    await os.mkdir("/qwerty/qws")
    await os.mkdir("/stressTest")
    for(var k = 0; k < 60; k++) {
      await os.mkdir("/stressTest/ok"+k)
    }
    
    await os.makeFile({
      path: "asdfg/lol/ok/sok.txt",
      data: `B"H
      LOL
      
      how are u !! `.repeat(8)
  })

  await os.makeFile({
    path: "asdfg/lol/ok/well.txt",
    data:`!`.repeat(4016  * 2)
})
  //  await os.mkdir("/wow/well/okThen")
    /*await os.mkdir("/welcome")
    await os.mkdir("/welcoe")
    await os.mkdir("/welcoe/1")
   
    
   await os.mkdir("/wowsee")
 //   await os.mkdir("/wellThere")
   /* await os.mkdir("/wowsee/lol")
    await os.mkdir("/wowsee/ok/well")
   */
})();
