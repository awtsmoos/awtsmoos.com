/*
B"H
Boruch Hashem
Biezrash Hashem
*/

import { compile } from './compiler.js';

// UI Logic
const radios = document.getElementsByName('appMode');
const infoList = document.getElementById('infoList');

function updateInfo() {
    const mode = Array.from(radios).find(r => r.checked).value;
    if (mode === 'console') {
        infoList.innerHTML = `
            <li>Platform: <span class="highlight">Windows x64</span></li>
            <li>Subsystem: <span class="highlight">Console</span></li>
            <li>Imports: <span class="highlight">KERNEL32.DLL</span></li>
            <li>Action: <span class="highlight">StdOut Write</span></li>
        `;
    } else {
        infoList.innerHTML = `
            <li>Platform: <span class="highlight">Windows x64</span></li>
            <li>Subsystem: <span class="highlight">GUI (Windows)</span></li>
            <li>Imports: <span class="highlight">KERNEL32, USER32</span></li>
            <li>Action: <span class="highlight">CreateWindow, WndProc, GDI Paint</span></li>
        `;
    }
}

radios.forEach(r => r.addEventListener('change', updateInfo));
updateInfo(); // Init

document.getElementById('compileBtn').addEventListener('click', () => {
    const input = document.getElementById('userText');
    const message = input.value || "Hello World from Awtsmoos!";
    const mode = Array.from(radios).find(r => r.checked).value;

    const statusEl = document.getElementById('status');
    statusEl.textContent = mode === 'gui' ? "Constructing Window Class & Message Loop..." : "Compiling binary...";
    statusEl.className = "status-msg status-loading";
    statusEl.classList.remove("hidden");
    
    try {
        const exeBlob = compile(message, mode);
        
        // Download
        const url = URL.createObjectURL(exeBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mode === 'gui' ? "awtsmoos_gui.exe" : "awtsmoos_console.exe";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusEl.textContent = "Compilation Complete. Executable Generated.";
        statusEl.className = "status-msg status-success";
        
    } catch (e) {
        console.error(e);
        statusEl.textContent = "Error: " + e.message;
        statusEl.className = "status-msg status-error";
    }
});