// B"H
// FILE: js/vibe/modules/stream-parser.js

export const StreamParser = {
    parse(fullText) {
        const files = [];
        const changeBlocks = fullText.split('<change>');
        
        for (let i = 1; i < changeBlocks.length; i++) {
            const block = changeBlocks[i];
            const fileObj = { path: null, operation: 'write', description: "Manifesting...", content: "", isComplete: false };

            const fileMatch = block.match(/<file>([\s\S]*?)<\/file>/);
            if (fileMatch) fileObj.path = fileMatch[1].trim();

            const opMatch = block.match(/<operation>([\s\S]*?)<\/operation>/);
            if (opMatch) fileObj.operation = opMatch[1].trim().toLowerCase();

            const descMatch = block.match(/<description>([\s\S]*?)<\/description>/);
            if (descMatch) fileObj.description = descMatch[1].trim();
            
            // Just grab everything between <content> and its end, or the end of the block.
            const contentStartIdx = block.indexOf('<content>') + 9;
            if (contentStartIdx > 8) {
                const contentEndIdx = block.lastIndexOf('</content>');
                if (contentEndIdx !== -1) {
                    fileObj.content = block.substring(contentStartIdx, contentEndIdx);
                    fileObj.isComplete = true;
                } else {
                    fileObj.content = block.substring(contentStartIdx); // Streaming...
                }
            }

            if (block.includes('</change>')) fileObj.isComplete = true;
            if (fileObj.path) files.push(fileObj);
        }
        return files;
    }
};