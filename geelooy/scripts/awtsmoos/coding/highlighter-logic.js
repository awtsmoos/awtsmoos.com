// B"H
/**
 * @file highlighter-logic.js
 * @description The core, language-agnostic highlighting engine (The Neshama's "intellect").
 * It processes highlighting requests using the appropriate tokenizer.
 */

import * as tokenizers from './tokenizer.js';

function _getInitialState(language) {
    const langMode = {
        js: 'javascript',
        html: 'html',
        css: 'css',
        c: 'c',
        json: 'json'
    };
    return {
        contextStack: [{ mode: langMode[language] || 'javascript' }],
        isNextTokenFunctionName: false,
        inCssRuleBlock: false
    };
}

function _getToken(line, i, state) {
    const context = state.contextStack[state.contextStack.length - 1];

    if (context.terminator && line.substring(i).startsWith(context.terminator)) {
        const terminatorLength = context.terminator.length;
        let type = 'string';
        if (context.mode.includes('comment')) type = 'comment';
        if (context.mode.includes('interpolation')) type = 'controlKeyword';
        if (context.terminator.startsWith('</')) type = 'tag';
        state.contextStack.pop();
        return {
            html: tokenizers.helpers._wrap(line.substring(i, i + terminatorLength), type),
            newIndex: i + terminatorLength
        };
    }

    let currentMode = context.mode;
    if (currentMode.startsWith('template_language_')) {
        currentMode = currentMode.substring(18);
    }
    
    // Dispatch to the correct language tokenizer
    switch (currentMode) {
        case 'javascript':
        case 'javascript_interpolation':
            return tokenizers.getJSToken(line, i, state);
        case 'html':
            return tokenizers.getHTMLToken(line, i, state);
        case 'css':
            return tokenizers.getCssToken(line, i, state);
        case 'c':
            return tokenizers.getCToken(line, i, state);
        case 'json':
             return tokenizers.getJSONToken(line, i, state);
        case 'template_literal': {
            const nextInterpolationIndex = tokenizers.helpers._findUnescaped(line, '${', i);
            const nextTerminatorIndex = tokenizers.helpers._findUnescaped(line, '`', i);
            let endOfChunk = line.length;
            if (nextInterpolationIndex !== -1) {
                endOfChunk = nextInterpolationIndex;
            }
            if (nextTerminatorIndex !== -1 && nextTerminatorIndex < endOfChunk) {
                endOfChunk = nextTerminatorIndex;
            }
            if (endOfChunk > i) {
                return {
                    html: tokenizers.helpers._wrap(line.substring(i, endOfChunk), 'string'),
                    newIndex: endOfChunk
                };
            }
            // Fallthrough to handle interpolation start or terminator
            break;
        }
        case 'comment':
        case 'string': {
            const endIdx = (context.mode === 'string')
                ? tokenizers.helpers._findUnescaped(line, context.terminator, i)
                : line.indexOf(context.terminator, i);

            const content = line.substring(i, endIdx !== -1 ? endIdx : line.length);
            return {
                html: tokenizers.helpers._wrap(content, context.mode),
                newIndex: i + content.length
            };
        }
    }

    // Default fallback if no specific tokenizer handles it
    if (line[i]) {
        return {
            html: tokenizers.helpers._escape(line[i]),
            newIndex: i + 1
        };
    }
    
    // Should not happen if line has content, but a safeguard
    return { html: '', newIndex: i + 1};
}


function _getHighlightResult(line, state) {
    if (!line) return { html: '&nbsp;', state };
    let html = '';
    let i = 0;
    while (i < line.length) {
        const i_before = i;
        const res = _getToken(line, i, state);
        html += res.html;
        i = res.newIndex;
        if (i === i_before) { // Failsafe to prevent infinite loops
            html += tokenizers.helpers._escape(line[i++]);
        }
    }
    return { html: html || '&nbsp;', state };
}

export function processHighlightRequest(requestData, workerState) {
    const { firstLineToRender, numLinesToRender } = requestData;
    const { language, lines, lineStatesCache, getClosestCachedState } = workerState;

    const { state: currentState, line: startLine } = getClosestCachedState(firstLineToRender - 1, _getInitialState);

    const newCachedStates = [];

    // Process lines from the last cached point to the start of the render area
    for (let i = startLine + 1; i < firstLineToRender; i++) {
        _getHighlightResult(lines[i] || '', currentState);
        newCachedStates.push({ lineIndex: i, state: JSON.parse(JSON.stringify(currentState)) });
    }

    // Now, highlight only the visible lines for the response
    const highlightedLines = [];
    for (let i = 0; i < numLinesToRender; i++) {
        const lineIndex = firstLineToRender + i;
        if (lineIndex < lines.length) {
            const result = _getHighlightResult(lines[lineIndex] || '', currentState);
            highlightedLines.push(result.html);
            
            if (!lineStatesCache[lineIndex]) {
                 newCachedStates.push({ lineIndex: lineIndex, state: JSON.parse(JSON.stringify(currentState)) });
            }
        } else {
            highlightedLines.push(null); // Signal end of content
        }
    }

    return { highlightedLines, newCachedStates };
}
