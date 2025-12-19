// B"H
/**
 * UI Modal Module
 * Replaces window.confirm with a custom DOM-based modal.
 */

let confirmModal = null;
let btnOk = null;
let btnCancel = null;
let confirmContentDiv = null;
let resolvePromise = null;

// B"H - New Token Inspector Modal
let tokenModal = null;
let btnCloseToken = null;

export function initModal() {
    confirmModal = document.getElementById('confirmModal');
    btnOk = document.getElementById('btnConfirmOk');
    btnCancel = document.getElementById('btnConfirmCancel');
    confirmContentDiv = document.getElementById('confirmContent');

    tokenModal = document.getElementById('tokenModal');
    btnCloseToken = document.getElementById('btnCloseToken');

    if (btnOk && btnCancel && confirmModal) {
        btnOk.onclick = () => {
            confirmModal.classList.add('hidden');
            if (resolvePromise) resolvePromise(true);
        };
        btnCancel.onclick = () => {
            confirmModal.classList.add('hidden');
            if (resolvePromise) resolvePromise(false);
        };
    }

    if (btnCloseToken && tokenModal) {
        btnCloseToken.onclick = closeTokenInspector;
    }
}

export function showConfirm(text) {
    if (!confirmModal || !confirmContentDiv) {
        // Fallback if DOM not ready (should not happen after init)
        return Promise.resolve(window.confirm(text)); 
    }
    
    confirmContentDiv.innerText = text;
    confirmModal.classList.remove('hidden');
    
    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
}

// B"H - Token Inspector Logic (Heatmap Edition)
export function showTokenInspector(tokenInfo) {
    if (!tokenModal) return;

    const { id, text, score, vector, sizeBytes } = tokenInfo;

    const el = (id) => tokenModal.querySelector(`#${id}`);
    
    if(el('tokenHeaderText')) el('tokenHeaderText').innerText = `TOKEN [${id}]`;
    if(el('tokenText')) el('tokenText').innerText = text ? text.replace('\u2581', ' ') : '...';
    if(el('tokenScore')) el('tokenScore').innerText = score ? score.toFixed(4) : 'N/A';
    if(el('tokenSizeBytes')) el('tokenSizeBytes').innerText = sizeBytes ? `${(sizeBytes/1024).toFixed(2)} KB` : 'Fetching...';

    const vecContainer = el('tokenVector');
    if (vecContainer) {
        vecContainer.innerHTML = '';
        vecContainer.className = 'vector-heatmap'; // Use Heatmap Grid CSS
        
        if (vector && vector.length > 0) {
            const frag = document.createDocumentFragment();
            let min = Infinity, max = -Infinity;
            for(let i=0; i<vector.length; i++) {
                if(vector[i] < min) min = vector[i];
                if(vector[i] > max) max = vector[i];
            }
            const range = max - min || 1;
            
            // Limit render to avoid freezing UI on 4k dimensions
            const limit = Math.min(vector.length, 2048);
            
            for(let i=0; i<limit; i++) {
                const cell = document.createElement('div');
                const val = vector[i];
                const norm = (val - min) / range; // Normalize 0-1
                const hue = (1.0 - norm) * 240; // Blue (low) to Red (high)
                
                cell.className = 'vec-cell';
                cell.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
                cell.title = `[${i}]: ${val.toFixed(4)}`;
                frag.appendChild(cell);
            }
            vecContainer.appendChild(frag);
            
            if (vector.length > limit) {
                const more = document.createElement('div');
                more.innerText = `... +${vector.length - limit} dims`;
                more.style.color = '#666';
                more.style.fontSize = '10px';
                vecContainer.appendChild(more);
            }
        } else {
            vecContainer.innerHTML = '<div style="padding:10px; color:#666;">Reading tensor data from worker...</div>';
        }
    }

    tokenModal.classList.remove('hidden');
}

export function closeTokenInspector() {
    if (tokenModal) {
        tokenModal.classList.add('hidden');
    }
}