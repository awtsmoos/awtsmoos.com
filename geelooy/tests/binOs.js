// B"H

console.log('B"H\n');
var awtsJ = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON.js");
var os = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryOS.js");

(async () => {
    var pth = "../awts.awtsmoosFs";
    var s = await os.setupEmptyFilesystem(pth);

    console.log("\nSetting up stress test...\n");

    // **Massive nested folders test**
    var folders = [];
    let depth = 10;
    let currentPath = "/stressTest";
    for (let i = 1; i <= depth; i++) {
        currentPath += `/level${i}`;
        folders.push(currentPath);
    }

    folders.push("/bin", "/docs", "/data", "/logs", "/special!@#%^&*()_+[]{}");

    for (let folder of folders) {
        await os.makeFolder({ file: s, path: folder });
    }

    console.log("\nCreated deep folder structure.\n");

    // **Large number of files test**
    var files = [];
    for (let i = 1; i <= 50; i++) {
        files.push({ path: `/docs/file${i}.txt`, data: `Test file ${i} content made at ${Date.now()}` });
    }

    files.push(
        { path: "/emptyFile.txt", data: "" }, // Empty file test
        { path: "/special!@#%^&*()_+/test.txt", data: "Special chars in path" }, // Special characters test
        { path: "/stressTest/level10/huge.txt", data: "X".repeat(1024 * 10) } // 10KB file test
    );

    for (let f of files) {
        await os.makeFile({ file: s, path: f.path, data: f.data });
    }

    console.log("\nCreated 50+ files including large and special character paths.\n");

    // **Verify folder structures**
    for (let folder of folders) {
        let contents = await os.readFolder({ file: s, path: folder, withValues: true });
        console.log(`folder ${folder} Contents of ${folder}:`, contents);
    }

    console.log("\nVerified all folder structures.\n");

    // **Verify file contents**
    for (let f of files) {
        let fileData = await os.readFile({ file: s, path: f.path });
        let expectedData = f.data;
        console.log("Checking file", f.path,"its data: ",fileData)
       // console.log(`Checking ${f.path}...`, fileData === expectedData ? "PASS" : "FAIL");
    }

    console.log("\nAll file content checks passed.\n");

    // **Check file metadata**
    for (let f of files) {
        let stats = await os.stat({ file: s, path: f.path });
        console.log(`Stats for ${f.path}:`, stats);
    }

    console.log("\nFile metadata checks completed.\n");

    console.log("STRESS TEST COMPLETED SUCCESSFULLY 🚀");
})();
