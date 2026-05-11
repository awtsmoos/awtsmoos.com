// B"H
/**
 * @file UniversalActionParser.js
 * @brief The bridge for non-native autonomous action.
 */

export const UniversalActionParser = {
    /**
     * B"H
     * Scans text for simulated tool call tags.
     * 
     * THE RECTIFICATION:
     * We use a robust scanning loop that allows for whitespace and line-breaks,
     * common when AI models try to format their "Universal Protocol" text.
     */
    parse(text) {
        if (!text || typeof text !== 'string') return [];

        const toolCalls = [];
        const openTagMarker = "<call:";
        const closeTagMarker = "</call:";

        let searchPos = 0;
        while (true) {
            const startIdx = text.indexOf(openTagMarker, searchPos);
            if (startIdx === -1) break;

            const nameStart = startIdx + openTagMarker.length;
            const nameEnd = text.indexOf(">", nameStart);
            if (nameEnd === -1) break;

            const funcName = text.substring(nameStart, nameEnd).trim();
            const closeTag = `${closeTagMarker}${funcName}>`;
            
            const contentStart = nameEnd + 1;
            const contentEnd = text.indexOf(closeTag, contentStart);

            if (contentEnd !== -1) {
                const argsStr = text.substring(contentStart, contentEnd).trim();
                
                toolCalls.push({
                    id: 'pseudo_' + Math.random().toString(36).substr(2, 9),
                    type: 'function',
                    function: {
                        name: funcName,
                        arguments: argsStr
                    },
                    isPseudo: true,
                    rawBlock: text.substring(startIdx, contentEnd + closeTag.length)
                });

                searchPos = contentEnd + closeTag.length;
            } else {
                break;
            }
        }

        return toolCalls;
    }
};