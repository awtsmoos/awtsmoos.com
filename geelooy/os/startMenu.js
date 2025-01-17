///B"H
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
    "New Folder":  async ({os}) => {
        const newFolder = prompt('Enter folder name:');
        if (newFolder) {
            await os.createFolder({path:"desktop", title: newFolder});
        }
    },
    "Import Files": async ({os}) => {
        await loadFiles(async (file) => {
            const content = file.type.startsWith("application/") ||
            file.type.startsWith('text/') 
            ? await file.text() 
            : await file.arrayBuffer(); // Handle binary/text files
            console.log(file)
            // Save each file to the desktop
            await os.createFile({
                path:"desktop", 
                title:
                file.name, 
                content
            });
        })
    },
    "Export All": async ({os}) => {
        var storeNames = await os.db.getAllStoreNames();
        var exportedContents = {};
        for(var store of storeNames) {
            const files = await os.db.getAllData(store); // Get all files
            const exportContent = JSON.stringify(files, null, 2); // Prepare JSON content
            exportedContents[store] = exportContent
            
        }
        // Create a downloadable file
        const blob = new Blob([exportedContents], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'exported_files.json'; // Set default filename
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
                    file.name.endsWith(".json")
                ) {
                    b = JSON.parse(content);
                }
            } catch(e) {

            }
            if(b) {
                console.log("Got special files", b);
                if(typeof(b) != "object") {
                    return;
                }
                Object.keys(b).forEach(async key => {
                    await os.createFile({
                        path:"desktop", 
                        title:
                        key, 
                        content:
                        b[key]
                    });
                   
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


async function loadFiles(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Allow multiple file selection
    input.style.display = 'none'; // Make input invisible
    document.body.appendChild(input);
    
    input.onchange = async () => {
        const files = Array.from(input.files);
        for (const file of files) {
            await callback?.(file);
            
        }
        alert(`${files.length} file(s) imported successfully!`);
        document.body.removeChild(input); // Clean up
    };
    
    input.click(); // Trigger file selection dialog
}
