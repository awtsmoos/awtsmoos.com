// B"H
// FILE: js/clipboard.js

/**
 * Clipboard Module: Handles copying text with fallback.
 */
export const Clipboard = {
    async write(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn("navigator.clipboard.writeText failed, falling back to execCommand.", err);
            try {
                const tempTextarea = document.createElement('textarea');
                tempTextarea.style.position = 'absolute';
                tempTextarea.style.left = '-9999px';
                tempTextarea.value = text;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(tempTextarea);
                
                if (!success) throw new Error('execCommand returned false.');
                return true;
            } catch (fallbackErr) {
                console.error("Fallback copy method also failed.", fallbackErr);
                return false;
            }
        }
    }
};