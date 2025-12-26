//B"H
import { makeInfoHTML as _makeInfoHTML } from "./ui/info.js";
import { showCustomContextMenu as _showCustomContextMenu } from "./ui/contextMenu.js";
import { makeNavBars as _makeNavBars } from "./ui/nav.js";

// Re-exporting for backward compatibility with existing imports
export const makeInfoHTML = _makeInfoHTML;
export const showCustomContextMenu = _showCustomContextMenu;
export const makeNavBars = _makeNavBars;

// Toast logic remains here as it's a simple utility
export function makeToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('ohr-ein-sof-toast');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Force reflow
    void toast.offsetWidth;
    
    requestAnimationFrame(() => toast.classList.add('ohr-ein-sof-toast-revealed'));
    setTimeout(() => {
        toast.classList.remove('ohr-ein-sof-toast-revealed');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
}
