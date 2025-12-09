
// B"H
// FILE: /Remember/awtsmoos/com/geelooy/os/programs/open-with-selector/index.js

import { programsByExtension, defaultPrograms, programs } from '../../basicPrograms.js';

export default ({ os, content, extension } = {}) => {
    const { filePath, fileTitle } = content;
    let compatiblePrograms = programsByExtension[extension] || [];
	
	// If no specific programs are listed, default to Advanced Code Editor
	// as it is optimized for all content types (including binary).
	if (compatiblePrograms.length === 0) {
	    compatiblePrograms.push('advancedCodeEditor');
	}
	
	// Ensure Advanced Code Editor is always an option if it isn't already
	if (!compatiblePrograms.includes('advancedCodeEditor')) {
	    compatiblePrograms.push('advancedCodeEditor');
	}

    let selectedProgram = defaultPrograms[extension] || compatiblePrograms[0]; 

    // --- Main Container ---
    const container = document.createElement('div');
    container.style.cssText = `padding: 20px; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; gap: 15px; height: 100%; background-color: #f0f0f0;`;

    const title = document.createElement('h3');
    title.textContent = `How do you want to open "${fileTitle}"?`;
    title.style.marginTop = '0';
    container.appendChild(title);

    // --- Program List ---
    const programList = document.createElement('div');
    programList.style.cssText = `display: flex; flex-direction: column; gap: 10px; flex-grow: 1; border: 1px solid #ddd; background: white; padding: 10px; border-radius: 5px;`;
    
    compatiblePrograms.forEach(progName => {
        const button = document.createElement('button');
        button.textContent = programs[progName]?.name || progName;
        button.dataset.progName = progName;
        button.style.cssText = `padding: 12px; border: 2px solid transparent; border-radius: 5px; cursor: pointer; background-color: #f9f9f9; text-align: left; font-size: 16px;`;
        
        button.onclick = () => {
            selectedProgram = progName;
            // Update visual selection
            programList.querySelectorAll('button').forEach(btn => {
                btn.style.borderColor = (btn.dataset.progName === selectedProgram) ? '#0078d7' : 'transparent';
                btn.style.fontWeight = (btn.dataset.progName === selectedProgram) ? 'bold' : 'normal';
            });
        };
        programList.appendChild(button);
    });
    container.appendChild(programList);

    // --- Action Buttons ---
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;`;

    const onceButton = document.createElement('button');
    onceButton.textContent = 'Just once';
    onceButton.style.cssText = `padding: 8px 16px; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;`;

    const alwaysButton = document.createElement('button');
    alwaysButton.textContent = 'Always';
    alwaysButton.style.cssText = `padding: 8px 16px; border: 1px solid #0078d7; background-color: #0078d7; color: white; border-radius: 5px; cursor: pointer;`;

    buttonContainer.append(onceButton, alwaysButton);
    container.appendChild(buttonContainer);

    // --- Event Logic ---
    const openFile = async (programToUse) => {
        const fileContent = await os.db.Laynin(filePath, fileTitle);
        os.addWindow({ title: fileTitle, content: fileContent, path: filePath, os: os, programName: programToUse });
        // Close this "Open With" window
        const thisWindowHeader = container.closest(`.${window.awtsmoosWindowID}-window`)?.querySelector('.window-header');
        thisWindowHeader?.querySelector('.close')?.click();
    };

    onceButton.onclick = () => openFile(selectedProgram);

    alwaysButton.onclick = async () => {
        await os.updateDefaultProgram(extension, selectedProgram);
        await openFile(selectedProgram);
    };

    // --- Initial Selection ---
    if(selectedProgram) {
        const defaultBtn = programList.querySelector(`button[data-prog-name="${selectedProgram}"]`);
        if(defaultBtn) defaultBtn.click();
        else if(programList.firstChild) programList.firstChild.click();
    }

    return { div: container };
};
