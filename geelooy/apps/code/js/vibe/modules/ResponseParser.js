// B"H
// FILE: js/vibe/modules/ResponseParser.js

export const ResponseParser = {
    /**
     * B"H - Parses the XML output from the AI to determine physical changes.
     * Aligned with the <change> schema.
     */
    parseChanges(text, rootPath) {
        // Remove markdown wrappers if present
        let cleanText = text;
        const xmlBlock = text.match(/```xml([\s\S]*?)```/i);
        if (xmlBlock) cleanText = xmlBlock[1];

        const changes = [];
        const changeRegex = /<change>([\s\S]*?)<\/change>/g;
        let match;

        while ((match = changeRegex.exec(cleanText)) !== null) {
            const block = match[1];
            
            const fileMatch = block.match(/<file>([\s\S]*?)<\/file>/);
            const opMatch = block.match(/<operation>([\s\S]*?)<\/operation>/);
            const contentMatch = block.match(/<content>([\s\S]*?)<\/content>/);
            
            if (fileMatch) {
                const relativePath = fileMatch[1].trim();
                const operation = opMatch ? opMatch[1].trim() : 'write';
                
                let content = '';
                if (contentMatch) {
                    content = contentMatch[1];
                    // Strip CDATA if explicit
                    if (content.startsWith('<![CDATA[')) {
                        const endIdx = content.lastIndexOf(']]>');
                        if (endIdx !== -1) content = content.substring(9, endIdx);
                    }
                    content = content.trim();
                }

                // Normalize path
                const fullPath = rootPath === '/' ? `/${relativePath}` : `${rootPath}/${relativePath}`;

                changes.push({
                    path: fullPath,
                    operation: operation,
                    content: content
                });
            }
        }
        
        return changes;
    }
};