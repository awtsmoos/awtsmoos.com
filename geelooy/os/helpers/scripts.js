//B"H

export  {
    loadFiles,
    importFiles
}

async function importFiles({
    os,
    path
}) {
    return await loadFiles(async (file) => {
        // B"H - Improved binary detection
        const isText = file.type.startsWith('text/') || 
                       file.type === 'application/json' ||
                       file.type === 'application/javascript' ||
                       file.type.includes('xml');
                       
        const content = isText
        ? await file.text() 
        : await file.arrayBuffer(); // Handle binary/text files
       
        // Save each file to the desktop
        await os.createFile({
            path, 
            title:
            file.name, 
            content
        });
    })
}

function loadFiles(callback) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true; 
        input.style.display = 'none'; 
        document.body.appendChild(input);
        
        input.onchange = async () => {
            const files = Array.from(input.files);
            if(files.length > 0) {
                for (const file of files) {
                    await callback?.(file);
                }
                alert(`${files.length} file(s) imported successfully!`);
            }
            document.body.removeChild(input); 
            resolve(files.length); // B"H - Resolve promise when done
        };
        
        // Handle cancel
        input.addEventListener('cancel', () => {
             document.body.removeChild(input);
             resolve(0);
        });

        input.click(); 
    });
}