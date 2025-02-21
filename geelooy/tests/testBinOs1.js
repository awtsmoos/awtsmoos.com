// B"H

console.log('B"H\n');
var awtsJ = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON.js");
var AwtsmoosFS = require("../../ayzarim/DosDB/awtsmoosFs/index.js");

(async () => {
    var pth = "../awts.awtsmoosFs";
    var os = new AwtsmoosFS(pth);
   
    var s = await os.setupFilesystem(pth);
    var fold = await os.mkdir("/wow")
    await os.mkdir("/ok1")
    await os.mkdir("/wow/well")
    await os.mkdir("/qwerty")

    await os.mkdir("/asdfg")

    await os.mkdir("/asdfg/lol")
    await os.mkdir("/asdfg/lol/ok")

    await os.mkdir("/qwerty/qws")
    await os.mkdir("/stressTest")
    /*await os.makeFile({
      path: "asdfg/lol/ok/sok.txt",
      data: `B"H
      LOL
      
      how are u !`
  })*/
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
