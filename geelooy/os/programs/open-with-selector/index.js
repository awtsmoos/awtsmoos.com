// B"H
// FILE: /Remember/awtsmoos.com/geelooy/os/programs/open-with-selector/index.js

import { programsByExtension, defaultPrograms, programs } from '../../basicPrograms.js';

export default ({ os, content, extension } = {}) => {
    const { filePath, fileTitle } = content;
    const compatiblePrograms = programsByExtension[extension] || [];
    const currentDefault = defaultPrograms[extension];

    // --- Main Container ---
    const container = document.createElement('div');
    container.style.cssText = `
        padding: 20px; font-family: 'Segoe UI', sans-serif;
        display: flex; flex-direction: column; gap: 15px; height: 100%;
        background-color: #f0f0f0;
    `;

    const title = document.createElement('h3');
    title.textContent = `How do you want to open "${fileTitle}"?`;
    title.style.marginTop = '0';
    container.appendChild(title);

    // --- Program List ---
    const programList = document.createElement('div');
    programList.style.cssText = `display: flex; flex-direction: column; gap: 10px; flex-grow: 1;`;

    compatiblePrograms.forEach(progName => {
        const button = document.createElement('button');
        button.textContent = programs[progName]?.name || progName; // Use the function name as a simple display name
        button.style.cssText = `
            padding: 12px; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;
            background-color: white; text-align: left; font-size: 16px;
        `;
        if (progName === currentDefault) {
            button.style.borderColor = '#0078d7';
            button.style.fontWeight = 'bold';
        }

        button.onclick = async () => {
            // Open the file with the chosen program
            const fileContent = await os.db.Laynin(filePath, fileTitle);
            os.addWindow({
                title: fileTitle,
                content: fileContent,
                path: filePath,
                os: os,
                programName: progName
            });
            // Close this "Open With" window
            // This is a simple way; a more robust OS would have a proper way to get the parent window
            const thisWindowHeader = container.closest(`.${window.awtsmoosWindowID}-window`).querySelector('.window-header');
            thisWindowHeader.querySelector('.close').click();
        };
        programList.appendChild(button);
    });
    container.appendChild(programList);

    // --- Set Default Option ---
    const setDefaultContainer = document.createElement('div');
    const setDefaultCheckbox = document.createElement('input');
    setDefaultCheckbox.type = 'checkbox';
    setDefaultCheckbox.id = 'set-default-checkbox';
    const setDefaultLabel = document.createElement('label');
    setDefaultLabel.textContent = 'Always use this app to open ' + extension + ' files';
    setDefaultLabel.htmlFor = 'set-default-checkbox';
    setDefaultContainer.append(setDefaultCheckbox, setDefaultLabel);
    
    // We'll add logic for this later. For now, it's just visual.
    // container.appendChild(setDefaultContainer);


    // This is the object the OS receives. The `div` property is what gets displayed.
    var self = {
        div: container
    };

    return self;
};