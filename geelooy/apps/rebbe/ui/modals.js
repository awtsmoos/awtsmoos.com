//B"H
// ui/modals.js

export function openModal(id) {
    const overlay = document.getElementById('overlay-layer');
    if(overlay) overlay.classList.remove('hidden');
    
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    
    const m = document.getElementById(id);
    if(m) m.classList.remove('hidden');
}

export function closeModal(id) {
    const m = document.getElementById(id);
    if(m) m.classList.add('hidden');
    // Hide overlay only if no other modals open
    const open = document.querySelectorAll('.modal:not(.hidden)');
    if(open.length === 0) document.getElementById('overlay-layer').classList.add('hidden');
}

export function updateVideoModalDefaults(currentTime) {
    const st = document.getElementById('vid-start');
    if(st) st.value = Math.floor(currentTime);
    const dur = document.getElementById('vid-duration');
    if(dur) dur.value = 15;
    
    const bar = document.getElementById('vid-progress-fill');
    if(bar) bar.style.width = '0%';
    
    const txt = document.getElementById('vid-status-text');
    if(txt) txt.textContent = "READY TO SLICE";
}

export function showContextMenu(x, y, data, el, actionCb) {
    const m = document.getElementById('ctx-menu');
    m.classList.remove('hidden');
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    m.innerHTML = `
        <div style="background:var(--c-cyan); color:black; padding:5px; font-weight:bold;">${data.title || 'OPTIONS'}</div>
        <div class="ctx-item" id="ctx-dl">DOWNLOAD MP3</div>
    `;
    document.getElementById('ctx-dl').onclick = () => {
        actionCb(data);
        m.classList.add('hidden');
    };
}