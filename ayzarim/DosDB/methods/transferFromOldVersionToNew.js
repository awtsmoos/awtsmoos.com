///B"H
var newWrite = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js")
module.exports = {

    async copyFromRegularToBinary(firstPath, destination) {
        try {
            var isBin = this.readAwtsmoosBinary;
            //this.readAwtsmoosBinary = false;
            var acc = await this.get(firstPath, {
                extra: true,
                pageSize: 10000
            });

            if (!acc) return {
                fail: firstPath, destination
            };
            let result = null;
            var isDir = !!acc.directory;
            console.log(acc)
            destination = await this.getAwtsmoosFilePath(destination, isDir, true)
            var isRegularFile = acc.file || acc.json;
            if (acc.dynamicEntry) {
                result = await this.writeAsBinaryFormat(
                    destination, 
                    acc.dynamicEntry,
                    {
                        customWriter: newWrite
                    }
                );
            } else if (isRegularFile) {
                result = await this.write(destination, acc.file || acc.json, {
                    override: true
                });	
            } else if (acc.directory) {
                // If it's a directory, recursively process each entry
                result = [];
                await this.ensureDir(destination, true)
                for (let entry of acc.directory) {
                    // Construct new destination path
                    let newDest = `${destination}/${entry}`;
                    let newSource = `${firstPath}/${entry}`; // Manually construct source path
                //	await this.ensureDir(newDest)
                    // Recursively copy entry
                    let res = await this.copyFromRegularToBinary(newSource, newDest);
                    let newRes = res?.success?.result;
                    
                    if (newRes) {
                        result.push(res);
                    } else if (res?.error) {
                        console.log("ERROR copying", res);
                        result.push({ error: res });
                    } else if (!res) {
                        result.push({ NULL: { destination, entry } });
                    }
                }
                result = result.filter(Boolean);
            } else {
                console.log("What did we do", acc)
            }
      //      this.readAwtsmoosBinary = isBin;
            return {
                success: {
                    firstPath,
                    destination,
                    result
                }
            };
        } catch (e) {
            console.trace(e);
            return {
                error: e.stack,
                firstPath,
                destination
            };
        }
    }
}