
// B"H
/**
 * @file line-logic.js
 * @brief The ritual of moving and transforming lines of code.
 * 
 * POEM OF THE SHIFTING LINE:
 * Above or below, the word finds its place,
 * Moving through shadows, in digital space.
 * To double the essence, to purge what is old,
 * In these holy functions, the power is hold.
 */

export class LineLogic {
    /**
     * @function duplicate
     * @description Clones the current focus into a new manifestation.
     */
    static duplicate(text, start, end) {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        let lineEnd = text.indexOf('\n', end);
        if (lineEnd === -1) lineEnd = text.length;
        const lineContent = text.substring(lineStart, lineEnd);
        return {
            content: (lineEnd === text.length ? '\n' : '') + lineContent + (lineEnd !== text.length ? '\n' : ''),
            pos: lineEnd
        };
    }

    /**
     * @function toggleComment
     * @description Shields the word from the executioner's eyes.
     */
    static toggleComment(text, start, end) {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineContent = text.substring(lineStart);
        const isCommented = lineContent.trim().startsWith('//');
        
        if (isCommented) {
            return {
                newText: text.substring(0, lineStart) + lineContent.replace(/\/\/\s?/, ''),
                offset: -3
            };
        } else {
            return {
                newText: text.substring(0, lineStart) + '// ' + lineContent,
                offset: 3
            };
        }
    }
}
