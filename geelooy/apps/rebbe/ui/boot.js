//B"H
// ui/boot.js
import { el } from './utils.js';

export async function runBootSequence() {
    const bootOverlay = document.createElement('div');
    bootOverlay.id = 'boot-sequence';
    bootOverlay.innerHTML = `
        <div class="boot-center">
            <div class="boot-logo">AWTSMOOS<br><span class="glitch" data-text="SYSTEMS">SYSTEMS</span></div>
            <div class="boot-log" id="boot-log"></div>
            <div class="boot-bar-container">
                <div class="boot-bar-fill" id="boot-fill"></div>
            </div>
        </div>
        <div class="boot-version">OMEGA KERNEL v9.0</div>
    `;
    document.body.appendChild(bootOverlay);

    const log = (msg, speed=50) => new Promise(r => {
        const l = document.getElementById('boot-log');
        const div = document.createElement('div');
        div.className = 'boot-line';
        div.innerHTML = `<span style="color:#0f0;">></span> ${msg}`;
        l.appendChild(div);
        l.scrollTop = l.scrollHeight;
        setTimeout(r, speed);
    });

    const setProgress = (pct) => {
        document.getElementById('boot-fill').style.width = `${pct}%`;
    };

    await new Promise(r => setTimeout(r, 200));
    await log("INIT BIOS...", 150);
    await log("CHECKING MEMORY INTEGRITY...", 100);
    setProgress(15);
    await log("MEMORY OK. 64TB ALLOCATED.", 100);
    await log("LOADING KERNEL MODULES...", 200);
    setProgress(40);
    await log("MOUNTING VIRTUAL FILESYSTEM...", 150);
    await log("INITIALIZING NEURAL NET...", 150);
    setProgress(65);
    await log("ESTABLISHING UPLINK TO ARCHIVE...", 300);
    await log("UPLINK SECURE.", 100);
    setProgress(90);
    await log("SYSTEM READY.", 200);
    setProgress(100);
    
    await new Promise(r => setTimeout(r, 400));
    
    bootOverlay.style.opacity = '0';
    bootOverlay.style.transform = 'scale(1.1)';
    setTimeout(() => bootOverlay.remove(), 1000);
}