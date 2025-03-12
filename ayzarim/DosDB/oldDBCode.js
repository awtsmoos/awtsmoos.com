//B"H
class OldDB {
/**
	 * @description goes through each
	 * key and writes it as a 
	 * folder with the value as a value
	 * file in it 
	 * with different file extension
	 * based on type string, number, bin etc.)
	 * 
	 * for nseted object repeats
	 * 
	 * also makes metadta file for retrieval
	 * @param {string full path} rPath 
	 * @param {JavaScript object} r 
	 */
async writeRecordDynamic(rPath, r, opts={}) {
    if(typeof(rPath) != "string" || !rPath)
        return false;
    if(typeof(r) != "object" || !r) {
        return false
    }
    var isArray = Array.isArray(r);
    var keys = Array.from(Object.keys(r));
    var originalKeys = keys;
    if(isArray) {
        keys = keys.concat("length")
    }
    var entries = {};
    /*
        have to check directory and delete 
           ALMOST all directories that are not found
              in it
      */
    var onlyUpdate = opts.onlyUpdate/*does not rewrite entire thing every time*/
    try {
        if(!onlyUpdate)
            await this.removeDirectory(rPath)
        
    } catch(e) {
        console.log("ISSUE writing",rPath,e)
        //return {error:e.stack, details: rPath}
    }
    var wrote =  []
    try {
        for(
            var k of keys
        ) {
            var pth = path.join(rPath, k)
            await this.ensureDir(pth, true);
            var isObj = false;
            var isAr = false;
            var ext = ".awts" //for string values
            var dataToWrite = r[k];
            switch(typeof(r[k])) {
                case "number":
                    ext = ".awtsNum";
                    dataToWrite += "";
                    
                    break;
                case "undefined":
                    dataToWrite += ""
                    ext = ".awtsUndef"
                    break;
                case "boolean":
                    ext = ".awtsBool";
                    dataToWrite += "";
                    break;
                case "object":
                    if(r[k] === null) {
                        ext = ".awtsNull"
                        dataToWrite += "";
                    } else {
                        if(Array.isArray(r[k])) {
                            isAr = true;
                        }
                        isObj = true;
                    }
                    break;
            }
            if(isObj) {
                var newPath = path.join(pth)
                var wr = await this.writeRecordDynamic(
                    newPath, r[k]
                );
                wrote.push({name: newPath, val: r[k], obj: wr})
                //console.log("Wrote dynamic?", k, keys[k], r[k])
                if(!isAr)
                    ext = ".awtsObj";
                else ext = ".awtsAr";
                dataToWrite = null //JSON.stringify(r[k]);
            }
            var val = "val" + ext;
            var joined = path.join(pth, val)
            
            try {
                if(dataToWrite !== null)
                    //   console.log("About to write it")
                    await fs.writeFile(
                        joined,
                        dataToWrite
                    );
                    wrote.push(joined)
                //  console.log("Wrote it",joined,dataToWrite)
            } catch (e) {
                console.log("Didnt write it")
                return {error: "Issue of writing", details: e.stack, path: joined}
            }
            entries[k] = val;
        }
        var meta = await this.writeMetadata({
            dataPath: rPath,
            isArray,
            entries
        });
        if(!meta) {
            console.log("Didn't write meta", dataPath)
            return {error: "No metadata", details: dataPath}
        }
    } catch (e) {
        console.log("Error writing:", e)
        return {error: e.stack};
    }
    return wrote;
}
async writeMetadata({
    dataPath,
    isArray,
    entries,
    type
}) {
    if(typeof(dataPath) != "string") {
        return false;
    }
    if(!type) {
        type = "record"
    }
    //  var dirName = path.dirname(dataPath)
    var metaPath = path.join(
        dataPath,
        "_awtsmoos.meta.entry.json"
    )
    var wasEmpty = !entries
    if(wasEmpty) {
        entries = {}
    }
    var dataToWrite = {
        entries,
        type,
        lastModified: Date.now()
    }
    if(isArray !== undefined) {
        dataToWrite.isArray = isArray;
    }
    var metaAlready = null;
    try {
        metaAlready = await fs.readFile(metaPath);
        metaAlready = JSON.parse(metaAlready);
    } catch (e) {}
    if(metaAlready) {
        dataToWrite.entries = {
            ...metaAlready.entries,
            ...dataToWrite.entries,
        }
    }
    if(wasEmpty) {
        /**
         * check if file already exists in 
         * entries. If not, add it.
         
        var base = path.basename(dataPath)
        var myFileName = dataToWrite.entries[base];
        if(!myFileName) {
            var fld = await fs.stat(dataPath);
            if(type != "directory") {
                var isDir = fld.isDirectory();
                dataToWrite.entries[base] = {
                    type: isDir ? "directory" : "file"
                }
            }
        }
        */
    }
    try {
        //   console.log("Tying",metaPath)
        await fs.writeFile(
            metaPath,
            JSON.stringify(dataToWrite)
        );
        //   console.log("Wrote the meta",metaPath,dataPath)
        return true;
        //  console.log("Wrote it all",dataToWrite)
    } catch (e) {
        console.log("Didnt write meta", e)
        return false;
    }
}
areAllKeysEqual(obj) {
    // Get the keys of the object
    const keys = Object.keys(obj);
    // If there are no keys or only one key, they are considered equal
    if(keys.length <= 1) {
        return true;
    }
    // Compare all keys with the first key
    const firstKey = keys[0];
    for(let i = 1; i < keys.length; i++) {
        if(keys[i] !== firstKey) {
            return false;
        }
    }
    // If all keys match the first key, return true
    return true;
}
/**
 * @description returns a JSON object
 * with mapped proeprties based
 * on input from @method writeRecordDynamic
 * @param {string} dynPath 
 * the dynamic full path to single "record".
 * this should be the directory that
 * has the _awtsmoos.meta.json file in it
 * @private record should be called with this.get
 * not directly
 */
async getDynamicRecord({
    filePath,
    properties,
    stat,
    derech,
    maxOrech,
    shouldNullify = false,
    meta = false
}) {
    // Initialize flag to track whether any property should be nullified
    let nullify = shouldNullify;
    if(typeof(filePath) != "string") {
        return false;
    }
    try {
        if(!stat.isDirectory()) {
            return null;
        }
        var dynPath = filePath;
        var bs = path.parse(dynPath).name;
        var mDerech = null;
        if(typeof(derech) == "string") {
            mDerech = derech.split("/")
        }
        var res = null;
        if(meta) {
            var modified = stat.mtime.toISOString()
            var made = stat.birthtime.toISOString()
            var size = stat.size
            res = {
                entityId: bs,
                size,
                modified,
                created: made
            };
            if(meta != "detailed")
                return res;
        }
        var metadata = await this.IsDirectoryDynamic(
            dynPath,
            stat
        );
        if(!metadata) return null;
        if(meta == "detailed") {
            res.details = metadata;
            return res;
        }
        var ents = null;
        var map = null;
        if(mDerech) {
            ents = [mDerech[0]];
        } else if(
            Array.isArray(properties)
        ) {
            ents = Array.from(properties);
        } else if(typeof(properties) == "object") {
            map = properties;
            // Object.assign(map, properties)
        }
        var mappedKeys = null;
        if(map) {
            mappedKeys = Object.keys(map);
        }
        var propertyFiles = Object.entries(
            metadata.entries
        );
        //   console.log("PROPERTY",propertyFiles, "MAPT",mappedKeys)
        //   console.log("GETTING",map,mappedKeys)
        var compiledData = {};
        for(
            var ent of propertyFiles
        ) {
            var equals = undefined;
            var includes = undefined;
            var raw=false
            var myMax = maxOrech;
            //  console.log("Checking prop",ent)
            if(mappedKeys) {
                if(!mappedKeys.includes(
                        ent[0]
                    )) {
                    continue;
                }
                var val = map[ent[0]]
                if(typeof(val) == "number")
                    myMax = val;
            }
            if(ents) {
                if(ent[0] != "length")
                    if(!ents.includes(ent[0])) {
                        continue;
                    }
            }
            if(ent[1].includes(".awtsUndef")) {
                return undefined;
            }
            if(ent[1].includes(".awtsNull")) {
                return null;
            }
            var propPath = path.join(
                dynPath,
                ent[0],
                ent[1]
            );
            if(ent[1].includes(".awtsObj") || ent[1].includes(".awtsAr")) {
                var subDynamicPath = path.join(dynPath, ent[0]);
                //   console.log("Finding sub path", subDynamicPath);
                var ob = {
                    filePath: subDynamicPath,
                    stat,
                    shouldNullify: nullify
                }
                if(mDerech) {
                    ob.properties = mDerech.slice(1)
                } else if(ents) {
                    ob.properties = ents.slice(1)
                } else if(map) {
                    var next = map[ent[0]]
                    if(next && typeof(next) == "object")
                        ob.properties = next
                }
                var val = await this.getDynamicRecord(ob);
                if(val === undefined) {
                    // return undefined;
                }
                if(mDerech) {
                    var modifiedValue = null;
                    
                    function getFinalVal(obj, keys, start) {
                        let value = obj;
                        for(let i = start; i < keys.length; i++) {
                            
                            const key = keys[i];
                            if(key == "_awtsmoosDeletify") {
                                return undefined;
                            }
                            if(value[key] !== undefined) {
                                value = value[key];
                            } else {
                                return undefined; // or handle error as needed
                            }
                        }
                        //value.essents = 2
                        return value;
                    }
                    var inp = {
                                    [ent[0]]: val
                    }
                    modifiedValue = getFinalVal(inp, mDerech, 0);
                    /*function getValue(obj, arr) {
                        return arr
                        .reduce(
                            (acc, key) => 
                            (acc && acc[key] !== 'undefined')
                             ? acc[key] : undefined, obj
                        );
                    }
                    try {

                        var finalVal = getValue(modifiedValue, mDerech)
                    
                        return finalVal//modifiedValue;
                    } catch(e) { 
                        return null;
                    }*/
                    //console.log("FINLA", modifiedValue)
                    //modifiedValue.wow = 123
                    return modifiedValue;
                    console.log("VALIUED", ent[0], inp, mDerech, modifiedValue)
                }
                if(val) {
                    var nullif = false;
                    for(var k in val) {
                        if(val[k].not && val[k] != ob.properties[k]) {
                            nullif = true;
                        }
                        
                    }
                    //compiledData.coby= 4
                    compiledData[ent[0]] = val
                    if(val._awtsmoosDeletify) {
                        nullif  = true;
                        val.wow=Date.now()
                        return undefined;
                    }
                    if(nullif) {
                        nullify = true;
                        compiledData["awts_"] = "delete"
                        //compiledData[ent[0]] = {not: "delete this"}
                    }
                }
                if(val === undefined) {
                    // compiledData[ent[0]] = "WHAT";
                    //nullify = true;
                    // return undefined;
                }
            } else {
                try {
                    var maxAmount = myMax && typeof(myMax) == "number" ?
                        myMax : null;
                    if(map) {
                        var settings = map[ent[0]];
                        var max = null;
                        var offset = 0;
                        if(settings && typeof(settings) == "object") {
                            max = settings.max;
                            equals = settings.equals;
                            includes = settings.includes;
                            offset = settings.offset || 0;
                            raw=settings.raw;
                            //  console.log("MAYBE",max,settings)
                        }
                        if(max && typeof(max) == "number") {
                            maxAmount = max;
                        }
                    }
                    if(maxAmount) {
                        var bytes = await this.readFileWithOffset(
                            propPath, offset, maxAmount
                        );
                        compiledData[ent[0]] = bytes.toString("utf-8")
                    } else {
                        try {
                            compiledData[ent[0]] = await fs.readFile(
                                propPath, "utf-8"
                            );
                        } catch (e) {
                            compiledData[ent[0]] = JSON.stringify({
                                message: "COULDN'T READ it?",
                                ent,
                                propPath,
                                stat
                            })
                        }
                    }
                    var res = compiledData[ent[0]];
                    // console.log("ASDDSASD",res,equals,propPath,ent)
                    // compiledData[ent[0]] = equals
                } catch (e) {
                    compiledData[ent[0]] = "hi! issue: " + e + " " + JSON.stringify({
                        keys: ent,
                        map,
                        propPath,
                        filePath
                    })
                    console.log("NOPE!", propPath, ent)
                }
            }
            if(ent[1].includes(".awtsNum")) {
                var num = parseFloat(compiledData[ent[0]]);
                if(!isNaN(num)) {
                    compiledData[ent[0]] = num
                }
                // console.log("NUMBER",num,compiledData[ent[0]])
            }
            if(ent[1].includes(".awtsBool")) {
                var bool = compiledData[ent[0]];
                if(bool == "false") {
                    compiledData[ent[0]] = false;
                } else if(bool == "true") {
                    compiledData[ent[0]] = true
                }
                // console.log("NUMBER",num,compiledData[ent[0]])
            }
            var res = compiledData[ent[0]]
            if(equals || equals === false || equals === 0 || equals === null) {
                if(res != equals) {
                    compiledData[ent[0]] = {
                        not: "delete this"
                    }
                    compiledData["_awtsmoosDeletify"] = true
                }
            }
            
            if(raw) {
                
                compiledData["_awtsmoosOnlyRaw"]=true
            }
            if(includes || includes === false || includes === 0) {
                if(!res.includes(includes)) {
                    compiledData[ent[0]] = {
                        not: "delete this"
                    }
                    compiledData["_awtsmoosDeletify"] = true
                }
            }
            //console.log(propPath,"Reading",ent,ent[1])
        }
        if(metadata.isArray) {
            compiledData = Array.from(compiledData)
            // console.log("Got array",compiledData)
        }
    //	console.log("DOING?!", compiledData)
        //if(compiledData[".awts_"] == "delete")
        if(nullify)
            return undefined;
        if (compiledData._awtsmoosDeletify) {
            return  {_awtsmoosDeletify:true}
        }
        if(compiledData._awtsmoosOnlyRaw) {
            var key = Object.keys(compiledData)
                .find(w=>w!="_awtsmoosOnlyRaw")
            if(key) {
                return compiledData[key]
            }
        }
        //return {"awtsmoos":compiledData}
        if(Array.isArray(compiledData)) {
        //	compiledData = compiledData.filter(q => !q._awtsmoosDeletify)
        }
        
        return compiledData;
    } catch (e) {
        console.log("Prob with index", e)
    }
    return null
}
/**
 * 
 * @param {string} filePath 
 * path to the directory to check
 * 
 * assuming u already called
 * fs.stat on the directory 
 * path to determine if 
 * its a directory.
 * @returns metadata
 * JAvaScript object
 * containg 
 * the properties 
 * of the "json" 
 * and relative paths
 * to find the values
 * along with indicator 
 * of the type
 * of json
 */
async IsDirectoryDynamic(
    filePath
) {
    var metaPath = path.join(
        filePath,
        "_awtsmoos.meta.entry.json"
    );
    var hasM = null;
    try {
        hasM = await fs.readFile(
            metaPath
        );
    } catch (e) {}
    if(!hasM) return null;
    var js = null;
    try {
        js = JSON.parse(hasM)
    } catch (e) {
        return null;
    }
    if(
        !js.entries ||
        typeof(js.entries) !=
        "object"
    ) {
        return null;
    }
    return js;
}
mapResults(w, propertyMap, mapToOne = true) {
    var p = propertyMap;
    if(!Array.isArray(propertyMap))
        return w;
    if(
        !p.length ||
        propertyMap.includes("entityId")
    ) return w;
    var ent = Object.entries(w)
    var fe = Object.fromEntries(
        ent.filter(q => {
            return propertyMap.includes(q[0])
        })
    )
    if(mapToOne) {
        fe = Object.values(fe)[0]
    }
    return fe
}
constructor(){}

async copyFromRegularToBinary(firstPath, destination) {
    try {
        var isBin = this.readAwtsmoosBinary;
        this.readAwtsmoosBinary = false;
        var acc = await this.get(firstPath, {
            extra: true,
            pageSize: 10000
        });

        if (!acc) return {
            fail: firstPath, destination
        };
        let result = null;
        var isDir = !!acc.directory
        destination = await this.getFilePath(destination, isDir, true)
        var isRegularFile = acc.file || acc.json;
        if (acc.dynamicEntry) {
            result = await this.writeAsBinaryFormat(destination, acc.dynamicEntry);
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
        }
        this.readAwtsmoosBinary = isBin;
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