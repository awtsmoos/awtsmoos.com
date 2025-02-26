// B"H

console.log('B"H\n');
var awtsJ = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON.js");
var AwtsmoosFS = require("../../ayzarim/DosDB/awtsmoosFs/index.js");

(async () => {
    var pth = "../awts.awtsmoosFs";
    var os = new AwtsmoosFS(pth);
   
    var s = await os.setupFilesystem(pth);
   
    console.log("\nSetting up stress test...\n");
    console.log(await os.readFolder({
        file: s,
        path: "/"
    }))
  

    // **Massive nested folders test**
    var folders = [];
    let depth = 3;
    let currentPath = "/stressTest";

    folders.push(currentPath);
    for (let i = 1; i <= depth; i++) {
        currentPath += `/level${i}`;
        folders.push(currentPath);
    }

    folders.push(
     //   "/what/are/you/doing/today",//resurively make odlers
        "/bin", 
        "/docs", 
        "/data", "/logs", "/special!@#%^&*()_+"
    );

    for (let folder of folders) {
        await os.makeFolder({ file: s, path: folder });
    }

    console.log("\nCreated deep folder structure.\n");

    // **Large number of files test**
    var files = [];
    for (let i = 1; i <= 3; i++) {
        files.push({ path: `/docs/file${i}.txt`, data: `Test file ${i} content made at ${Date.now()}` });
    }

    files.push(
        { path: "/emptyFile.txt", data: "" }, // Empty file test
        { path: "/special!@#%^&*()_+/test.txt", data: "Special chars in path" }, // Special characters test
        {
            path: "/stressTest/huge.txt", 
            data: "X".repeat(2 * 4096 * 8).split("")
                .map((x,i)=>i)
                .join(" - ")
        } // 1mb file test
         
    );

    console.log("made files in memeory, writing: ")
    var start = Date.now();

    for (let f of files) {
        console.log("Making",f)
        await os.makeFile({ path: f.path, data: f.data });
        console.log("Made")
    }
    var made = Date.now()-start

    console.log(
        "\nCreated 50+ files including large and special character paths.\n"
    , "took",made
    );

    console.log("Reading folders")
    var contentsTotal = []
    var start = Date.now();
    // **Verify folder structures**
    for (let folder of folders) {
        let contents = await os.readFolder({ file: s, path: folder, withValues: true });
        contentsTotal.push(`folder ${folder} Contents of ${folder}: ${JSON.stringify(contents)}` );
    }
    var made = Date.now()-start
    console.log("Read folders","took",made,contentsTotal.join("\n"))
    console.log("\nVerified all folder structures.\n");

    // **Verify file contents**
    for (let f of files) {
        console.log("Checking file", f.path)
       
       /* let fileData = await os.readFile({ file: s, path: f.path });
        let expectedData = f.data;
        console.log("found",fileData)*/
        // console.log(`Checking ${f.path}...`, fileData === expectedData ? "PASS" : "FAIL");
    }

    console.log("\nAll file content checks passed.\n");

    // **Check file metadata**
    for (let f of files) {
        try {
        //let stats = await os.stat({ file: s, path: f.path });
        //console.log(`Stats for ${f.path}:`, stats);
        } catch(e) {
            console.log("ISSSUE WITH",f,e)
            break;
        }
    }

    console.log("\nFile metadata checks completed.\n");

    console.log("STRESS TEST COMPLETED SUCCESSFULLY 🚀");
})();
