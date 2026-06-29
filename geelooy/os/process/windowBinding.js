// B"H
export function bindWindowToProcess(process, window) { process.windows ||= []; if (!process.windows.includes(window.id)) process.windows.push(window.id); return process; }
