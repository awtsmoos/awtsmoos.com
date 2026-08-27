
// B"H
/**
 * @file input-log.js
 * @brief THE SCRIBE OF THE USER'S PRAYER.
 */

import { HTML } from '../../../../html-generator.js';
import { LineStyler } from '../rendering/LineStyler.js';

export const InputLogRenderer = {
    render(log, state) {
        const style = LineStyler.applyInputAura(LineStyler.getBaseStyle());
        const codeText = log.args[0]?.value || "";

        return HTML({
            className: 'dt-console-input-echo',
            style: style,
            children: [
                { 
                    tag: 'span', 
                    style: { 
                        color: 'var(--neon-cyan)', 
                        fontWeight: 'bold', 
                        marginRight: '12px',
                        fontSize: '1.1em',
                        userSelect: 'none'
                    }, 
                    text: '>' 
                },
                {
                    tag: 'span',
                    style: { 
                        color: '#fff', 
                        opacity: '0.9',
                        fontFamily: 'var(--font-code)' 
                    },
                    text: codeText
                }
            ]
        });
    }
};
