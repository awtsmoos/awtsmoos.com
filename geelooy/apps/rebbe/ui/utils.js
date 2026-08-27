//B"H
// ui/utils.js

export function log(msg, isError) {
    const term = document.getElementById('terminal');
    if (!term) return; 
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = `> ${msg}`;
    if (isError) line.style.color = 'var(--c-magenta)';
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
}

export function toggleTerminal() {
    const t = document.getElementById('terminal-wrap');
    if(t) t.classList.toggle('hidden');
}

export function fmt(s) {
    if(isNaN(s) || !isFinite(s)) return "00:00";
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60);
    return `${m}:${sec<10?'0'+sec:sec}`;
}

export function el(id) {
    return document.getElementById(id);
}