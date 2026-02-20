// B"H
// FILE: js/vibe/modules/ResponseParser.js

/**
 * --- RESPONSE PARSER ---
 * The organ of interpretation. It decodes the AI's XML speech into 
 * physical file operations while handling path resolution and 
 * sanitizing potential CDATA wrappers. B"H.
 */
export const ResponseParser = {
    parseChanges(text, rootPath) {
        console.log("[ResponseParser] >>> STARTING PARSE RITUAL <<<");
        console.log("[ResponseParser] Session Root Path:", rootPath);
        
        if (!text) {
            console.error("[ResponseParser] No text provided to parser!");
            return [];
        }

        // We use text/html because it is highly tolerant of raw code symbols (<, >, &)
        // that would normally cause a text/xml parser to crash.
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        
        const changes = [];
        const changeNodes = doc.querySelectorAll('change');
        
        console.log(`[ResponseParser] Detected ${changeNodes.length} potential <change> blocks.`);

        // A textarea is our secret weapon for decoding HTML entities like &lt; or &quot;
        const decoder = document.createElement('textarea');

        changeNodes.forEach((node, index) => {
            const fileEl = node.querySelector('file');
            const opEl = node.querySelector('operation');
            const contentEl = node.querySelector('content');
            const descEl = node.querySelector('description');

            if (!fileEl) {
                console.warn(`[ResponseParser] Change block ${index} is missing the <file> tag. Skipping.`);
                return;
            }

            const aiPath = fileEl.textContent.trim();
            const operation = opEl ? opEl.textContent.trim().toLowerCase() : 'write';
            const description = descEl ? descEl.textContent.trim() : '';
            
            // --- 1. EXTRACT CONTENT ---
            let content = '';
            if (contentEl) {
                // We use innerHTML to capture everything inside the tags, 
                // including raw brackets and existing CDATA wrappers.
                decoder.innerHTML = contentEl.innerHTML;
                content = decoder.value;

                // --- 2. THE CDATA SANITIZATION RITUAL ---
                // If the AI (or a strict parser) wrapped the code in CDATA markers,
                // we strip them manually to ensure only the pure source code remains.
                let trimmedContent = content.trim();
                if (trimmedContent.startsWith('<![CDATA[')) {
                    console.log(`[ResponseParser] Block ${index}: CDATA wrapper detected. Stripping prefix/suffix.`);
                    // Remove <![CDATA[ from the start
                    content = content.replace('<![CDATA[', '');
                    // Remove ]]> from the end (using lastIndexOf to be precise)
                    const endMarkerIdx = content.lastIndexOf(']]>');
                    if (endMarkerIdx !== -1) {
                        content = content.substring(0, endMarkerIdx);
                    }
                }
            }

            // --- 3. INTELLIGENT PATH RESOLUTION ---
            // Goal: Avoid duplication (e.g., /wow1/wow1/file.js) while ensuring 
            // the path is absolute relative to the workspace root.
            const cleanRoot = rootPath.replace(/\/+$/, ""); // Remove trailing slash
            let finalPath;
            
            // Normalize the AI path to start with a slash
            const normAIPath = aiPath.startsWith("/") ? aiPath : "/" + aiPath;
            
            // Check if the AI path already includes the session root
            if (normAIPath.startsWith(cleanRoot + "/")) {
                // It's already an absolute path
                finalPath = normAIPath;
            } else {
                // It's a relative path, so we join it to the root
                finalPath = cleanRoot + normAIPath;
            }

            console.log(`[ResponseParser] Block ${index} Result:`, {
                originalAIPath: aiPath,
                resolvedPath: finalPath,
                op: operation,
                size: content.length
            });

            changes.push({ 
                path: finalPath, 
                operation, 
                description, 
                content 
            });
        });
        
        console.log(`[ResponseParser] >>> PARSE COMPLETE <<<. Manifesting ${changes.length} valid changes.`);
        return changes;
    }
};