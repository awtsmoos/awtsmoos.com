///B"H
import {
    loadFiles
} from "/os/helpers/scripts.js"
export default {
    "New File":  async ({os}) => {
        const newFile = prompt('Enter file name:');
        if (newFile) {
            await os.createFile({
                path:"desktop", 
                title:
                newFile, 
                content:
                `Content of ${newFile}`
            });
            
        }
    },
    "New Folder":  async ({os, path}) => {
        const newFolder = prompt('Enter folder name:');
        if (newFolder) {
            await os.createFolder({path:"desktop", title: newFolder});
        }
    },
    "Import Files": async ({os}) => {
       importFiles({
        os,
        path:"desktop"
       })
    },
    "Export All": async ({os}) => {
        var storeNames = await os.db.getAllStoreNames();
        var exportedContents = {};
        for(var store of storeNames) {
            const files = await os.db.getAllData(store); // Get all files
            exportedContents[store] = files
            
        }
        // Create a downloadable file
        const blob = new Blob([
            JSON.stringify(exportedContents, null, "\t")
        ], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `BH_AwtsmoosOS_Export_${Date.now()}.awtsmoosExport.json`; // Set default filename
        a.style.display = 'none';
        document.body.appendChild(a);
        
        a.click(); // Trigger download
        URL.revokeObjectURL(a.href); // Clean up
        document.body.removeChild(a);
        alert('All files exported successfully!');
    },
    "Import Exported Files": async ({os}) => {
        await loadFiles(async (file) => {
            const content = file.type.startsWith("application/") ||
            file.type.startsWith('text/') 
            ? await file.text() 
            : await file.arrayBuffer(); // Handle binary/text files
            console.log(file)
            var b = null;
            try {
                if(file.name.startsWith("BH_Scripts_Of_Awtsmoos")) {
                    var ur = URL.createObjectURL(
                        new Blob([content], {
                            type:"application/javascript"
                        }) 
                    );
                    b = (await import(ur))?.default;
                } else if(
                    typeof(content) == "string" && 
                    file.name.endsWith(".awtsmoosExport.json")
                ) {
                    b = JSON.parse(content);
                }
            } catch(e) {

            }
            if(b) {
                Object.keys(b).forEach(async path => {
                    var array = b[path];
                    array.forEach(async obj => {
                        Object.keys(obj).forEach(async key => {
                            await os.createFile({
                                path, 
                                title:
                                key, 
                                content:
                                obj[key]
                            });
                           
                        })
                    })
                    console.log("Got special files", b);
                    
                    
                })
               
            } else {
                await os.createFile({
                    path:"desktop", 
                    title:
                    file.name, 
                    content
                });
            }
        })
    },
    "File Explorer": async ({os}) => {
        await os.addWindow({
            title:"root.folder", 
            content: "", 
            path:"home", 
            os
        })
    },
    
};
