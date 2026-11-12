// B"H
import { emulatePortableExecutable } from './core/emulator.js';
import { createVirtualWindows } from './core/virtualWindows.js';
import { createDemoPe } from './core/demoPe.js';

const el = id => document.getElementById(id);
const host = createVirtualWindows(el('desktop'), el('console'));
let currentBuffer = null;
let runCount = 0;

el('exeFile').addEventListener('change', async event => {
  const file = event.target.files[0];
  currentBuffer = file ? await file.arrayBuffer() : null;
  el('report').textContent = file ? `Loaded ${file.name} (${file.size} bytes)` : '';
});

el('demoConsole').addEventListener('click', () => loadDemo('console'));
el('demoWindow').addEventListener('click', () => loadDemo('gui'));
el('runBtn').addEventListener('click', runEmulator);

function loadDemo(mode) {
  currentBuffer = createDemoPe(mode);
  el('report').textContent = `Loaded ${mode} demo PE image.`;
  runEmulator();
}

function runEmulator() {
  // The console demo is loaded at startup, so re-running it replays the same
  // deterministic output. Stamp every run with its number and time so each
  // click visibly registers instead of looking dead.
  runCount += 1;
  host.clear();
  try {
    if (!currentBuffer) throw new Error('Choose an EXE or load a demo first.');
    const result = emulatePortableExecutable(currentBuffer, host);
    el('report').textContent = JSON.stringify(result, null, 2);
    host.print(`Emulation run #${runCount} finished at ${new Date().toLocaleTimeString()}.`);
  } catch (error) {
    el('report').textContent = `Emulation failed: ${error.message}`;
    host.print(`Loader fault (run #${runCount}): ${error.message}`);
  }
}

loadDemo('console');
