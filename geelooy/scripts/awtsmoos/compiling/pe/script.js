/*
B"H
Boruch Hashem
Biezrash Hashem
*/

import { compile } from './compiler.js';
import { ASM_EXAMPLES } from './asm/examples/index.js';
import { C_EXAMPLES } from './c/examples/index.js';

// UI Logic
const radios = document.getElementsByName('appMode');
const infoList = document.getElementById('infoList');
const standardInputGroup = document.getElementById('standardInputGroup');
const asmInputGroup = document.getElementById('asmInputGroup');
const asmEditor = document.getElementById('asmEditor');
const asmSelect = document.getElementById('asmExampleSelect');
const cSelect = document.getElementById('cExampleSelect');
const asmLabel = document.querySelector('label[for="asmEditor"]');

function updateInfo() {
    const mode = Array.from(radios).find(r => r.checked).value;
    
    // Toggle Inputs
    if (mode === 'asm' || mode === 'c') {
        standardInputGroup.classList.add('hidden');
        asmInputGroup.classList.remove('hidden');
        
        if (mode === 'asm') {
            asmLabel.textContent = "Assembly Source (x64)";
            asmSelect.classList.remove('hidden');
            cSelect.classList.add('hidden');
            // If empty or C code, reset to ASM default
            if (!asmEditor.value.trim() || !asmEditor.value.includes('.subsystem')) {
                 asmEditor.value = ASM_EXAMPLES.hello;
            }
        } else {
            asmLabel.textContent = "Custom C Source";
            asmSelect.classList.add('hidden');
            cSelect.classList.remove('hidden');
            
            // ALWAYS force load default C example if switching to C mode and content is not C-like or empty
            // This fixes "first example doesn't show up"
            if (!asmEditor.value.trim() || asmEditor.value.includes('.subsystem')) {
                asmEditor.value = C_EXAMPLES.hello;
                cSelect.value = "hello"; 
            }
        }
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
    } else if (mode === 'asm') {
         infoList.innerHTML = `
            <li>Platform: <span class="highlight">Windows x64</span></li>
            <li>Features: <span class="highlight">Labels, Macros, RIP-Rel</span></li>
            <li>Control: <span class="highlight">CMP, JMP, CALL, RET</span></li>
            <li>Data: <span class="highlight">Variables, Arrays</span></li>
        `;
    } else {
        infoList.innerHTML = `
            <li>Lang: <span class="highlight">Awtsmoos C</span></li>
            <li>Features: <span class="highlight">Structs, Pointers, Recursion</span></li>
            <li>Compiles To: <span class="highlight">Native Assembly</span></li>
            <li>Output: <span class="highlight">Standalone EXE</span></li>
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

// C Example Selector
cSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (C_EXAMPLES[key]) {
        asmEditor.value = C_EXAMPLES[key];
    }
});

// Populate C Select options dynamically
function populateCSelect() {
    cSelect.innerHTML = '';
    const options = {
        hello: "Load: Hello World (GUI)",
        console: "Load: Console Output",
        echo: "Load: Echo Input",
        input: "Load: Input Box (GUI)",
        fib: "Load: Fibonacci (Recursion)",
        file: "Load: File I/O",
        list_dir: "Load: List Files (Win32)",
        mandelbrot: "Load: Mandelbrot (Math)",
        window: "Load: Native Window"
    };
    for(const [key, label] of Object.entries(options)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = label;
        cSelect.appendChild(opt);
    }
}
populateCSelect();

// Init
updateInfo(); 

document.getElementById('compileBtn').addEventListener('click', () => {
    const mode = Array.from(radios).find(r => r.checked).value;
    
    let sourceInput;
    if (mode === 'asm' || mode === 'c') {
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
                if (mode === 'console') a.download = 'console_app.exe';
                else if (mode === 'asm') a.download = 'asm_app.exe';
                else if (mode === 'c') a.download = 'c_app.exe';
                else a.download = 'gui_app.exe';
                
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