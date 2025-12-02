///B"H

import {
    loadFiles,
    importFiles
} from "/os/helpers/scripts.js"
import System from "/os/system.js" // Import the System class

export default {
    "New File":  async ({os}) => {
        const sys = new System({os});
        const newFile = await sys.prompt('Enter file name:');
        if (newFile) {
            await os.createFile({
                path:"desktop.folder", 
                title: newFile, 
                content: `//B"H\n// Content of ${newFile}`
            });
            sys.makeToast(`Created file "${newFile}"`, "success");
        }
    },
    "New Folder":  async ({os}) => {
        const sys = new System({os});
        const newFolder = await sys.prompt('Enter folder name:');
        if (newFolder) {
            await os.createFolder({path:"desktop.folder", title: newFolder});
            sys.makeToast(`Created folder "${newFolder}"`, "success");
        }
    },
    "Import Files": async ({os}) => {
       importFiles({
        os,
        path:"desktop.folder"
       })
    },
    "Export All": async ({os}) => {
        // ... (Export logic is fine, no prompts here usually) ...
        var storeNames = await os.db.getAllStoreNames();
        var exportedContents = {};
        for(var store of storeNames) {
            const files = await os.db.getAllData(store); 
            exportedContents[store] = files
        }
        const blob = new Blob([
            JSON.stringify(exportedContents, null, "\t")
        ], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `BH_AwtsmoosOS_Export_${Date.now()}.awtsmoosExport.json`; 
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click(); 
        URL.revokeObjectURL(a.href); 
        document.body.removeChild(a);
        
        // Use makeToast instead of alert
        new System({os}).makeToast('All files exported successfully!', "success");
    },
    "Import Exported Files": async ({os}) => {
        // ... (Import logic) ...
        await loadFiles(async (file) => {
            // ... (Existing logic) ...
            const content = file.type.startsWith("application/") ||
            file.type.startsWith('text/') 
            ? await file.text() 
            : await file.arrayBuffer(); 
            
            var b = null;
            try {
                if(file.name.startsWith("BH_Scripts_Of_Awtsmoos")) {
                    var ur = URL.createObjectURL(new Blob([content], {type:"application/javascript"}));
                    b = (await import(ur))?.default;
                } else if(typeof(content) == "string" && file.name.endsWith(".awtsmoosExport.json")) {
                    b = JSON.parse(content);
                }
            } catch(e) {}

            if(b) {
                Object.keys(b).forEach(async path => {
                    var array = b[path];
                    array.forEach(async obj => {
                        Object.keys(obj).forEach(async key => {
                            await os.createFile({
                                path, 
                                title: key, 
                                content: obj[key]
                            });
                        })
                    })
                })
            } else {
                await os.createFile({
                    path:"desktop.folder", 
                    title: file.name, 
                    content
                });
            }
        });
    },
    "File Explorer": async ({os}) => {
        await os.addWindow({
            title:"Home", 
            content: "", 
            path:"/",
            programName: "awtsmoosFileExplorer",
            os
        })
    },
};