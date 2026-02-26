
// B"H
/**
 * @file input-log.js
 * @brief Renders the user's past commands visibly and immediately.
 */

import { HTML } from '../../../../html-generator.js';
import { LogStyles } from './styles.js';

export const InputLogRenderer = {
    render(log) {
        const style = { ...LogStyles.base, ...LogStyles.input };
        const codeContent = log.args[0]?.value || "";

        return HTML({
            style: style,
            children: [
                { 
                    tag: 'span', 
                    style: { color: 'var(--color-text-tertiary)', userSelect: 'none', marginRight: '8px', fontWeight: 'bold' }, 
                    text: '> ' 
                },
                {
                    tag: 'span',
                    className: 'dt-obj-string', // Re-use object viewer style for consistency
                    style: { 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-all', 
                        fontFamily: 'var(--font-code)',
                        color: 'var(--color-text-primary)' 
                    },
                    text: codeContent
                }
            ]
        });
    }
};
