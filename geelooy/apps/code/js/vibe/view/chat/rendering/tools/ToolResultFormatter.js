
// B"H
/**
 * @file ToolResultFormatter.js
 * @brief Slices raw text results into beautiful HTML Blueprints without backticks.
 */

export const ToolResultFormatter = {
    /**
     * B"H - Slices a massive bulk read into a pristine array of collapsible JSON HTML nodes.
     */
    format(text) {
        if (!text || typeof text !== 'string') return text;
        if (text.indexOf('### File: `') === -1) return text;
        
        const files = text.split('### File: `');
        const children = [];
        
        files.forEach((f, i) => {
            if (i === 0 && f.trim() === '') return;
            
            const lines = f.split('\n');
            let pathLine = lines[0];
            const endTick = pathLine.indexOf('`');
            
            let path = pathLine;
            let depthMarker = "";

            if (endTick !== -1) {
                path = pathLine.substring(0, endTick);
                depthMarker = pathLine.substring(endTick + 1).trim(); 
            }
            
            const rest = f.substring(pathLine.length).trim();
            const cleanCode = rest.replace(/^```[\w]*\n/, '').replace(/```\s*$/, '').replace(/---\s*$/, '').trim();
            const safeCode = cleanCode.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>');

            children.push({
                tag: 'details',
                style: { margin: '6px 0', border: '1px solid rgba(0,246,255,0.2)', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', overflow: 'hidden' },
                children: [
                    { 
                        tag: 'summary', 
                        style: { padding: '8px 12px', cursor: 'pointer', color: 'var(--neon-cyan)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', userSelect: 'none', outline: 'none' }, 
                        children: [
                            { tag: 'span', text: '📄 ' + path },
                            { tag: 'span', style: { fontSize: '0.8em', color: 'var(--neon-magenta)' }, text: depthMarker }
                        ]
                    },
                    { 
                        tag: 'pre', 
                        style: { padding: '10px 15px', margin: 0, overflowX: 'auto', color: 'var(--neon-lime)', borderTop: '1px solid rgba(0,246,255,0.1)', fontSize: '0.9em', maxHeight: '400px' }, 
                        html: '<code>' + safeCode + '</code>' 
                    }
                ]
            });
        });

        // B"H - Ensuring this returns the EXACT structure expected by our ToolCardUpdater
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' },
            children: children
        };
    },

    /**
     * B"H - Forges a beautiful terminal-like display for streaming JSON arguments.
     */
    formatStreamArgs(rawArgs, funcName) {
        if (!rawArgs) return 'Receiving divine intent...';
        
        let displayString = rawArgs;
        
        if (funcName === 'engrave_vessel' || funcName === 'run_ui_test') {
            const contentMarker = '"content":';
            const contentIdx = rawArgs.indexOf(contentMarker);
            if (contentIdx !== -1) {
                let extracted = rawArgs.substring(contentIdx + contentMarker.length).trim();
                if (extracted.indexOf('"') === 0) extracted = extracted.substring(1);
                
                extracted = extracted.split('\\n').join('\n').split('\\"').join('"').split('\\\\').join('\\').split('\\t').join('\t');
                displayString = extracted;
            }
        }

        const safeArgs = displayString.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>');
        
        return {
            tag: 'div',
            style: { padding: '10px 15px', margin: 0, overflowX: 'auto', color: 'var(--neon-lime)', border: '1px dashed rgba(0,246,255,0.3)', background: 'rgba(0,0,0,0.8)', fontSize: '0.9em', maxHeight: '400px', borderRadius: '4px' },
            children: [
                { tag: 'pre', style: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, html: '<code>' + safeArgs + '</code>' }
            ]
        };
    }
};
