// B"H
// FILE: js/vibe/modules/ResponseParser.js

export const ResponseParser = {
    parseChanges(text, rootPath) {
        // B"H - Per your instruction: No more delimiters, just trust the parser.
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<root>${text}</root>`, "text/html");
        
        const changes = [];
        const changeNodes = doc.querySelectorAll('change');
        
        // This textarea is our universal decoder for any HTML entities.
        const decoder = document.createElement('textarea');

        changeNodes.forEach(node => {
            const fileEl = node.querySelector('file');
            if (!fileEl) return;

            const relativePath = fileEl.textContent.trim();
            const opEl = node.querySelector('operation');
            const operation = opEl ? opEl.textContent.trim().toLowerCase() : 'write';
            const descEl = node.querySelector('description');
            const description = descEl ? descEl.textContent.trim() : '';

            let content = '';
            const contentEl = node.querySelector('content');
            if (contentEl) {
                // 1. Get the raw innerHTML. It may contain escaped entities like '&lt;'.
                const rawHTML = contentEl.innerHTML;
                
                // 2. The magic trick: The browser decodes the entities when we set it here.
                decoder.innerHTML = rawHTML;
                
                // 3. Reading .value gives us the pure, unescaped, original code.
                content = decoder.value;
            }

            // Normalize the path for the file system
            const fullPath = rootPath === '/' ? `/${relativePath}` : `${rootPath}/${relativePath}`;
            changes.push({ path: fullPath, operation, description, content });
        });
        
        return changes;
    }
};