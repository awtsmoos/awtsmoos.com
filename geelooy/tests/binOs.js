// B"H

console.log('B"H\n')
var awtsJ = require ("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON.js");
var os = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryOS.js");
(async () => {
    var pth = "../awts.awtsmoosFs";

    var s = await os.setupEmptyFilesystem(pth);

    // Create multiple files and folders
    var files = [
        { path: "/file1.txt", data: "Hello world!" },
        { path: "/file2.txt", data: "Another test file." },
        { path: "/nested/file3.txt", data: "Deep file." },
        { path: "/nested/file4.json", data: '{"key": "value"}' },
        { path: "/nested/deeper/file5.js", data: "console.log('Deepest file!');" },
        { path: "/bin/script.sh", data: "#!/bin/bash\necho Hello" },
        { path: "/bin/tool.exe", data: "BINARYDATA" },
        { path: "/docs/readme.md", data: "# Read Me\nWelcome to the test filesystem!" }
    ];

    

    // Create multiple folders
    var folders = [
        "/nested", 
        "/nested/deeper", 
        "/nested/deeper/deeperStil", 
        "/nested/deeper/evenDeeper",
        "/nested/deeper/evenDeeper/wayEvenDeeper",
        "/bin", "/docs", "/data", "/logs"]
        ;
    
    for (let folder of folders) {
        await os.makeFolder({ file: s, path: folder });
    }
/*
    for (let f of files) {
        await os.makeFile({ file: s, path: f.path, data: f.data });
    }
*/
    // Read root directory
    var rootContents = await os.readFolder({ file: s, path: "/", withValues: true });
    console.log("Root contents:", rootContents);

    // Read nested directory
    var nestedContents = await os.readFolder({ file: s, path: "/nested", withValues: true });
    console.log("Nested contents:", nestedContents);
    var nest2Blcok = rootContents["nested"];
    var bl =await os.readBlock({
        file:s,
        blockId:nest2Blcok,
        metadata:false
    })
    var dt=bl?.data;
    var j = awtsJ.deserializeBinary(dt)
    console.log("NEsged block",j)


    var nest2Blcok = j["deeper"];
    var bl =await os.readBlock({
        file:s,
        blockId:nest2Blcok,
        metadata:false
    })
    var dt=bl?.data;
    var j = awtsJ.deserializeBinary(dt)
    console.log("deeper block",j)

    var nest2Blcok = j["evenDeeper"];
    var bl =await os.readBlock({
        file:s,
        blockId:nest2Blcok,
        metadata:false
    })
    var dt=bl?.data;
    var j = awtsJ.deserializeBinary(dt)
    console.log("still even deeper block",j)
    // Read deeper directory
    var deepContents = await os.readFolder({ file: s, path: "/nested/deeper", withValues: true });
    console.log("Deeper contents:", deepContents);




    /*
    // Read files back to verify
    for (let f of files) {
        let fileData = await os.readFile({ file: s, path: f.path });
        console.log(`Read ${f.path}:`, fileData);
    }*/

})();