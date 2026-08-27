// B"H
// FILE: js/mime-util.js

const MimeMap = {
    // Text-based files (will be opened in the editor)
    '.js':   { type: 'text', mime: 'application/javascript' },
    '.mjs':  { type: 'text', mime: 'application/javascript' },
    '.json': { type: 'text', mime: 'application/json' },
    
    '.awtsmoosJSON':  { type: 'text', mime: 'application/json' },
    '.css':  { type: 'text', mime: 'text/css' },
    '.html': { type: 'text', mime: 'text/html' },
    '.htm':  { type: 'text', mime: 'text/html' },
    '.xml':  { type: 'text', mime: 'text/xml' },
    '.yml':  { type: 'text', mime: 'text/plain' },
    
    '.svg':  { type: 'text', mime: 'text/xml' },
    '.md':   { type: 'text', mime: 'text/markdown' },
    '.txt':  { type: 'text', mime: 'text/plain' },
    '.py':   { type: 'text', mime: 'text/x-python' },
    '.sh':   { type: 'text', mime: 'application/x-sh' },
    '.c':    { type: 'text', mime: 'text/x-c' },
    '.cc':    { type: 'text', mime: 'text/x-c' },
    '.cpp':  { type: 'text', mime: 'text/x-c++' },
    '.h':    { type: 'text', mime: 'text/x-h' },
    '.java': { type: 'text', mime: 'text/x-java-source' },
    '.log':  { type: 'text', mime: 'text/plain' },
    '.properties':  { type: 'text', mime: 'text/plain' },
    '.gradle':  { type: 'text', mime: 'text/plain' },
    

    // Image files (will be previewed)
    '.png':  { type: 'image', mime: 'image/png' },
    '.jpg':  { type: 'image', mime: 'image/jpeg' },
    '.jpeg': { type: 'image', mime: 'image/jpeg' },
    '.gif':  { type: 'image', mime: 'image/gif' },
   // '.svg':  { type: 'image', mime: 'image/svg+xml' },
    '.webp': { type: 'image', mime: 'image/webp' },
    '.ico':  { type: 'image', mime: 'image/x-icon' },
    '.bmp':  { type: 'image', mime: 'image/bmp' },

    // Video files (will be previewed)
    '.mp4':  { type: 'video', mime: 'video/mp4' },
    '.webm': { type: 'video', mime: 'video/webm' },
    '.ogv':  { type: 'video', mime: 'video/ogg' },

    // Audio files (will be previewed)
    '.mp3':  { type: 'audio', mime: 'audio/mpeg' },
    '.wav':  { type: 'audio', mime: 'audio/wav' },
    '.ogg':  { type: 'audio', mime: 'audio/ogg' },
    '.m4a':  { type: 'audio', mime: 'audio/mp4' },

    // PDF files (will be previewed)
    '.pdf':  { type: 'pdf', mime: 'application/pdf' },
    
    // Archives
    '.zip': { type: 'zip', mime: 'application/zip' }
};

const defaultType = { type: 'binary', mime: 'application/octet-stream' };

export const MimeUtil = {
    getInfo(filename = '') {
        if (!filename || !filename.includes('.')) {
            return { type: 'text', mime: 'text/plain' };
        }
        
        // 1. Check for the exact, case-sensitive extension first.
        if (filename.endsWith('.awtsmoosJSON')) {
            return MimeMap['.awtsmoosJSON'];
        }

        // 2. If it's not our special case, fall back to the original lowercase logic.
        const extension = '.' + filename.split('.').pop().toLowerCase();
        return MimeMap[extension] || defaultType;
    }
};