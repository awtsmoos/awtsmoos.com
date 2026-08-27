// B"H
// FILE: js/clipboard.js

/**
 * Clipboard Module: Handles copying text and files with fallback.
 */
export const Clipboard = {
    /**
     * Writes content to the system clipboard.
     * @param {string|Blob|File} content - The text or File/Blob to copy.
     * @returns {Promise<boolean>} True if successful.
     */
    async write(content) {
        try {
            // Handle File/Blob objects (The "Fake File" logic)
            if (content instanceof Blob) {
                const mimeType = content.type || 'text/plain';
                
                // B"H - Attempt to write as a ClipboardItem
                // We provide the content as the specific MIME type.
                // For a "fake file" effect, we rely on the browser's handling of File objects
                // passed to standard MIME types (like text/plain).
                try {
                    const item = new ClipboardItem({
                        [mimeType]: content
                    });
                    await navigator.clipboard.write([item]);
                    return true;
                } catch (blobErr) {
                    console.warn("ClipboardItem write failed, falling back to text.", blobErr);
                    // If the fancy file copy fails, convert to text and try standard method
                    const text = await content.text();
                    return this.writeText(text);
                }
            }
            
            // Handle standard string content
            return this.writeText(String(content));

        } catch (err) {
            console.error("Clipboard write failed.", err);
            return false;
        }
    },

    /**
     * Internal helper for text copying with legacy fallback.
     */
    async writeText(text) {
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