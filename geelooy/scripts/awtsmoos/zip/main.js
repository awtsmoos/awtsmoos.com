// B"H
import { ZipFile } from './encoder.js';
import { ZipReader } from './decoder.js';
console.log('B"H');
// B"H

// Wait for DOM to be fully ready
document.addEventListener('DOMContentLoaded', () => {
    
    // UI References
    const fileNameInput = document.getElementById('fileNameInput');
    const fileContentInput = document.getElementById('fileContentInput');
    const addTextBtn = document.getElementById('addTextBtn');
    const fileUploadInput = document.getElementById('fileUploadInput');
    const folderNameInput = document.getElementById('folderNameInput');
    const addFolderBtn = document.getElementById('addFolderBtn');
    const fileList = document.getElementById('fileList');
    const emptyMsg = document.getElementById('emptyMsg');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusMsg = document.getElementById('statusMsg');
    const statusContainer = document.getElementById('statusContainer');
    
    // Decoder References
    const zipReadInput = document.getElementById('zipReadInput');
    const readList = document.getElementById('readList');
    const readEmptyMsg = document.getElementById('readEmptyMsg');

    // Initialize Zip Logic
    let zip;
    let fileCount = 0;
    let reader;

    try {
        zip = new ZipFile();
        reader = new ZipReader();
        log("Awtsmoos Zip Engine Ready. Write or Read modes active.");
    } catch (e) {
        logError("Failed to initialize Zip Engine: " + e.message);
    }

    /**
     * Updates the status message on screen
     */
    function log(msg) {
        if (statusContainer) statusContainer.classList.add('visible');
        if (statusMsg) {
            statusMsg.textContent = "> " + msg;
            statusMsg.className = 'log-msg-info';
        }
        console.log(msg);
    }

    function logError(msg) {
        if (statusContainer) statusContainer.classList.add('visible');
        if (statusMsg) {
            statusMsg.textContent = "ERROR: " + msg;
            statusMsg.className = 'log-msg-error';
        }
        console.error(msg);
    }

    /**
     * Renders a file entry in the UI list using the new Void CSS classes.
     */
    function addToList(name, type, size) {
        if (fileCount === 0 && emptyMsg) {
            emptyMsg.style.display = 'none';
        }
        fileCount++;
        if (downloadBtn) downloadBtn.disabled = false;

        const div = document.createElement('div');
        div.className = "file-item"; // New CSS class
        
        const icon = type === 'Folder' ? '📁' : '📄';
        
        div.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${icon}</span>
                <span class="file-name" title="${name}">${name}</span>
            </div>
            <div class="file-size">
                ${size}
            </div>
        `;
        
        if (fileList) {
            fileList.appendChild(div);
            fileList.scrollTop = fileList.scrollHeight;
        }
    }

    // --- ENCODER HANDLERS ---

    // Handler: Add Text File
    if (addTextBtn) {
        addTextBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop any form submit
            const name = fileNameInput.value.trim();
            const content = fileContentInput.value;

            if (!name) {
                logError("Please specify a filename first.");
                return;
            }

            try {
                zip.addFile(name, content);
                addToList(name, 'File', `${content.length} bytes`);
                log(`Created entity: "${name}"`);
                
                // Clear inputs
                fileNameInput.value = '';
                fileContentInput.value = '';
                fileNameInput.focus();
            } catch (e) {
                logError("Error adding file: " + e.message);
            }
        });
    }

    // Handler: Add Folder
    if (addFolderBtn) {
        addFolderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let name = folderNameInput.value.trim();
            
            if (!name) {
                logError("Please specify a folder name.");
                return;
            }

            try {
                // Ensure proper formatting
                if (!name.endsWith('/')) name += '/';
                
                zip.addFolder(name);
                addToList(name, 'Folder', '0 bytes');
                log(`Created container: "${name}"`);
                
                folderNameInput.value = '';
                folderNameInput.focus();
            } catch (e) {
                logError("Error adding folder: " + e.message);
            }
        });
    }

    // Handler: Upload Files (Write)
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            log(`Assimilating ${files.length} file(s)...`);

            for (const file of files) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    
                    zip.addFile(file.name, uint8Array);
                    addToList(file.name, 'File', `${file.size} bytes`);
                } catch (err) {
                    logError(`Error reading ${file.name}: ${err.message}`);
                }
            }
            
            log(`Successfully assimilated ${files.length} file(s).`);
            fileUploadInput.value = '';
        });
    }

    // Handler: Download
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (fileCount === 0) return;

            log("Compressing Reality...");
            
            // Timeout allows the UI to render the 'Generating' message
            setTimeout(() => {
                try {
                    const blob = zip.build();
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "awtsmoos_archive.zip";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    log("Archive successfully materialized.");
                } catch (e) {
                    logError("Critical Error generating ZIP: " + e.message);
                    console.error(e);
                }
            }, 100);
        });
    }

    // --- DECODER HANDLERS ---

    if (zipReadInput) {
        zipReadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            log("Scanning archive structure...");
            readEmptyMsg.style.display = 'none';
            readList.innerHTML = ''; // Clear previous

            try {
                await reader.load(file);
                const entries = reader.getEntries();
                
                log(`Found ${entries.length} entries in archive.`);

                if(entries.length === 0) {
                     readList.innerHTML = '<p class="empty-state">Archive is empty.</p>';
                     return;
                }

                entries.forEach(entry => {
                    const div = document.createElement('div');
                    // Add downloadable class
                    div.className = "file-item file-item-downloadable"; 
                    
                    const icon = entry.isDir ? '📁' : '👁️';
                    // Show compressed ratio if file
                    const sizeInfo = entry.isDir ? 'Dir' : 
                        `${entry.uncompressedSize} b ${entry.method===8 ? '(zipped)' : ''}`;

                    div.innerHTML = `
                        <div class="file-info">
                            <span class="file-icon">${icon}</span>
                            <span class="file-name" title="${entry.filename}">${entry.filename}</span>
                        </div>
                        <div class="file-size">
                            ${sizeInfo} ${entry.isDir ? '' : '⬇'}
                        </div>
                    `;

                    // Click to extract
                    if (!entry.isDir) {
                        div.style.cursor = 'pointer';
                        div.title = "Click to Extract & Download";
                        div.addEventListener('click', async () => {
                            try {
                                log(`Extracting ${entry.filename}...`);
                                const blob = await entry.getData();
                                
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                // Simple extraction of filename from path
                                const simpleName = entry.filename.split('/').pop() || 'extracted_file';
                                a.download = simpleName;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                
                                log(`Extracted: ${entry.filename}`);
                            } catch(err) {
                                logError(`Extraction Failed: ${err.message}`);
                            }
                        });
                    }

                    readList.appendChild(div);
                });

            } catch (err) {
                logError("Failed to parse ZIP: " + err.message);
                readList.innerHTML = `<p class="empty-state" style="color:red">Error: ${err.message}</p>`;
            }

            // Clear input so same file can be reloaded
            zipReadInput.value = '';
        });
    }
});
