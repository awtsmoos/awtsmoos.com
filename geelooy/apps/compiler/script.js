/*
B"H
Boruch Hashem
Biezrash Hashem
*/

import { compile } from './compiler.js';
import { ASM_EXAMPLES } from './asm/examples/index.js';

// UI Logic
const radios = document.getElementsByName('appMode');
const infoList = document.getElementById('infoList');
const standardInputGroup = document.getElementById('standardInputGroup');
const asmInputGroup = document.getElementById('asmInputGroup');
const asmEditor = document.getElementById('asmEditor');
const asmSelect = document.getElementById('asmExampleSelect');

function updateInfo() {
    const mode = Array.from(radios).find(r => r.checked).value;
    
    // Toggle Inputs
    if (mode === 'asm') {
        standardInputGroup.classList.add('hidden');
        asmInputGroup.classList.remove('hidden');
        if (!asmEditor.value) asmEditor.value = ASM_EXAMPLES.hello;
    } else {
        standardInputGroup.classList.remove('hidden');
        asmInputGroup.classList.add('hidden');
    }

    // Update Info
    if (mode === 'console') {
        infoList.innerHTML = `
            <li>Platform: <span class="highlight">Windows x64</span></li>
            <li>Subsystem: <span class="highlight">Console</span></li>
            <li>Imports: <span class="highlight">KERNEL32.DLL</span></li>
            <li>Action: <span class="highlight">StdOut Write</span></li>
        `;
    } else if (mode === 'gui') {
        infoList.innerHTML = `
            <li>Platform: <span class="highlight">Windows x64</span></li>
            <li>Subsystem: <span class="highlight">GUI (Windows)</span></li>
            <li>Imports: <span class="highlight">KERNEL32, USER32</span></li>
            <li>Action: <span class="highlight">MessageBoxA</span></li>
        `;
    } else {
         infoList.innerHTML = `
            <li>Platform: <span class="highlight">Windows x64</span></li>
            <li>Subsystem: <span class="highlight">Configurable</span></li>
            <li>Features: <span class="highlight">Memory Ops, Labels, Loops</span></li>
            <li>Control: <span class="highlight">CMP, JMP, CALL, RET</span></li>
        `;
    }
}

radios.forEach(r => r.addEventListener('change', updateInfo));

// ASM Example Selector
asmSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (ASM_EXAMPLES[key]) {
        asmEditor.value = ASM_EXAMPLES[key];
    }
});

updateInfo(); // Init

document.getElementById('compileBtn').addEventListener('click', () => {
    const mode = Array.from(radios).find(r => r.checked).value;
    
    let sourceInput;
    if (mode === 'asm') {
        sourceInput = asmEditor.value;
    } else {
        const input = document.getElementById('userText');
        sourceInput = input.value || "Hello World from Awtsmoos!";
    }

    const statusEl = document.getElementById('status');
    statusEl.textContent = "Compiling binary...";
    statusEl.className = "status-msg status-loading";
    statusEl.classList.remove("hidden");
    
    try {
        // Delay slightly to allow UI to render status
        setTimeout(() => {
            try {
                const exeBlob = compile(sourceInput, mode);
                
                // Download
                const url = URL.createObjectURL(exeBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = mode === 'console' ? "awtsmoos_console.exe" : "awtsmoos_app.exe";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                statusEl.textContent = "Compilation Complete. Executable Generated.";
                statusEl.className = "status-msg status-success";
            } catch (innerErr) {
                console.error(innerErr);
                statusEl.textContent = "Error: " + innerErr.message;
                statusEl.className = "status-msg status-error";
            }
        }, 50);
        
    } catch (e) {
        console.error(e);
        statusEl.textContent = "Error: " + e.message;
        statusEl.className = "status-msg status-error";
    }
});