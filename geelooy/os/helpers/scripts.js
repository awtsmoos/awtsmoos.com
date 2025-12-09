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
        input.multiple = true; // Allow multiple file selection
        input.style.display = 'none'; // Make input invisible
        document.body.appendChild(input);
        
        input.onchange = async () => {
            const files = Array.from(input.files);
            if(files.length > 0) {
                for (const file of files) {
                    await callback?.(file);
                }
                alert(`${files.length} file(s) imported successfully!`);
            }
            document.body.removeChild(input); // Clean up
            resolve(files.length);
        };
        
        // Optional: Detect cancel (focus return) - simple implementation
        // If user cancels, this promise might hang without a timeout or focus listener,
        // but for standard file input API, onchange is the only reliable event.
        
        input.click(); // Trigger file selection dialog
    });
}