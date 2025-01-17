//B"H

export  {
    loadFiles,
    importFiles
}

async function importFiles({
    os,
    path
}) {
    await loadFiles(async (file) => {
        const content = file.type.startsWith("application/") ||
        file.type.startsWith('text/') 
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
