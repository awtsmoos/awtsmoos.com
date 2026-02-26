
// B"H
/**
 * @file log-renderer.js
 * @brief The Conductor of the Console Stream.
 */

import { HTML } from '../../../html-generator.js';
import { InputLogRenderer } from './renderers/input-log.js';
import { StandardLogRenderer } from './renderers/standard-log.js';

export const LogRenderer = {
    attach(container, state) {
        const outputWrap = HTML({
            className: 'dt-console-output',
            style: { 
                flexGrow: '1', 
                overflowY: 'auto', 
                padding: '10px', 
                fontFamily: 'var(--font-code)', 
                fontSize: '0.9em', 
                background: 'var(--color-bg-deep)', 
                wordBreak: 'break-all', 
                width: '100%' 
            }
        });
        
        container.appendChild(outputWrap);

        const printLog = (log) => {
            let logElement;
            if (log.level === 'input') {
                logElement = InputLogRenderer.render(log);
            } else {
                logElement = StandardLogRenderer.render(log);
            }
            
            outputWrap.appendChild(logElement);
            requestAnimationFrame(() => outputWrap.scrollTop = outputWrap.scrollHeight);
        };

        // Render History
        if (state.logs && state.logs.length > 0) {
            state.logs.forEach(printLog);
        }

        // Listen for new logs
        state.onLog = printLog;
        
        return printLog;
    }
};
