// B"H
// FILE: js/vibe/modules/stream-parser.js

export const StreamParser = {
    /**
     * B"H - Decodes the Divine Flow (Stream) into UI-ready file objects.
     */
    parse(fullText) {
        const files = [];
        
        // Split by <change> tags to isolate files
        const changeBlocks = fullText.split('<change>');
        
        // Skip the first split result as it's before the first <change>
        for (let i = 1; i < changeBlocks.length; i++) {
            const block = changeBlocks[i];
            
            const fileObj = {
                path: null,
                operation: 'write', 
                description: "Generating...",
                content: "",
                isComplete: false
            };

            // Extract File Path
            const fileMatch = block.match(/<file>([\s\S]*?)<\/file>/);
            if (fileMatch) fileObj.path = fileMatch[1].trim();

            // Extract Operation
            const opMatch = block.match(/<operation>([\s\S]*?)<\/operation>/);
            if (opMatch) fileObj.operation = opMatch[1].trim().toLowerCase();

            // Extract Description
            const descMatch = block.match(/<description>([\s\S]*?)<\/description>/);
            if (descMatch) fileObj.description = descMatch[1].trim();

            // Extract Content (Streaming logic)
            if (fileObj.operation === 'write') {
                const cdataStart = block.indexOf('<![CDATA[');
                if (cdataStart !== -1) {
                    const contentStart = cdataStart + 9; 
                    const cdataEnd = block.indexOf(']]>', contentStart);
                    
                    if (cdataEnd !== -1) {
                        fileObj.content = block.substring(contentStart, cdataEnd);
                        fileObj.isComplete = true; // CDATA closed
                    } else {
                        // Stream is mid-content
                        fileObj.content = block.substring(contentStart);
                        fileObj.isComplete = false; 
                    }
                }
            } else {
                // Non-write operations are complete if they have path + desc
                if (fileObj.path && fileObj.description) {
                    fileObj.isComplete = true;
                }
            }

            if (fileObj.path) {
                files.push(fileObj);
            }
        }

        return files;
    }
};