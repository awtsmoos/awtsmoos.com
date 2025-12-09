// B"H
export const handleDragStart = (e, itemPath, isSelected, body) => {
    let pathsToMove = [];
    if (isSelected) {
        const selectedEls = body.querySelectorAll('.selected');
        selectedEls.forEach(el => {
            if (el.dataset.path) pathsToMove.push(el.dataset.path);
        });
    } else {
        body.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        e.target.classList.add('selected');
        pathsToMove = [itemPath];
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(pathsToMove));
};

export const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
};

export const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
};

// Reusable logic for both Drop and Paste
export const processNativeFiles = async (filesList, targetFolderPath, os, system, refreshCallback) => {
    const files = Array.from(filesList);
    let importedCount = 0;
    
    for (const file of files) {
        const isText = file.type.startsWith('text/') || 
                       file.type === 'application/json' ||
                       file.type === 'application/javascript' ||
                       file.type.includes('xml');
        try {
            const content = isText ? await file.text() : await file.arrayBuffer();
            await os.createFile({
                path: targetFolderPath,
                title: file.name,
                content: content
            });
            importedCount++;
        } catch (err) {
            console.error("Error importing file:", file.name, err);
        }
    }
    
    if (importedCount > 0) {
        system.makeToast(`${importedCount} file(s) imported.`, "success");
        if (refreshCallback) refreshCallback();
    }
};

export const handleDrop = async (e, targetFolderPath, os, system, refreshCallback) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    // 1. Native OS File Drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processNativeFiles(e.dataTransfer.files, targetFolderPath, os, system, refreshCallback);
        return;
    }

    // 2. Internal App Drop
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
        const sourcePaths = JSON.parse(data);
        if (!Array.isArray(sourcePaths)) return;

        let movedCount = 0;
        for (const src of sourcePaths) {
            const fileName = src.split('/').pop();
            const dest = targetFolderPath === '/' ? fileName : `${targetFolderPath}/${fileName}`;
            const currentParent = src.substring(0, src.lastIndexOf('/')) || '/';
            
            if (src !== dest && currentParent !== targetFolderPath) {
                await os.db.move(src, dest);
                movedCount++;
            }
        }
        if (movedCount > 0 && refreshCallback) {
            refreshCallback();
        }
    } catch (err) {
        console.error("Drop failed:", err);
        system.makeToast("Failed to move items: " + err.message);
    }
};

export const handlePaste = async (e, targetFolderPath, os, system, refreshCallback) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        await processNativeFiles(e.clipboardData.files, targetFolderPath, os, system, refreshCallback);
    }
};