
// B"H
/**
 * @file standard-log.js
 * @brief THE PROJECTOR OF LOGICAL FORMS.
 * 
 * CHAPTER LVII: THE ECHO
 * 
 * POEM OF THE CRYSTALLIZED ECHO:
 * The Word returns from the silent deep,
 * With promises and secrets it meant to keep.
 * If the args are empty, if the box is void,
 * A shadow of 'undefined' is then employed.
 * We build the manifestations with care and light,
 * Ensuring the Oracle's answer is clear and bright.
 */

import { HTML } from '../../../../html-generator.js';
import { ObjectViewer } from '../object-viewer.js';
import { LogStyles } from './styles.js';

export const StandardLogRenderer = {
    /**
     * B"H - Renders a standard log from the sandbox or a return value.
     */
    render(log, state) {
        const isEcho = !!log.isEvalResult;
        console.log(`[StandardLog] B"H - Rendering ${isEcho ? 'Oracle Result' : 'System Log'}`);

        let style = { ...LogStyles.base };
        
        // Define color according to sanctity/severity
        if (log.level === 'error') {
            Object.assign(style, LogStyles.error);
        } else if (log.level === 'warn') {
            Object.assign(style, LogStyles.warn);
        } else {
            Object.assign(style, LogStyles.log);
        }

        // B"H - SPECIAL RADIANCE: Echo (Return) state
        if (isEcho) {
            style.backgroundColor = 'rgba(168, 255, 0, 0.04)';
            style.borderLeft = '3px solid var(--neon-cyan)';
            style.paddingLeft = '8px';
            style.boxShadow = '0 0 10px rgba(0, 246, 255, 0.1) inset';
        }

        // Dissect arguments through the microscope
        // B"H - Ensure args is always an array
        const logArgs = log.args || [];
        const childManifestations = logArgs.map((arg, i) => {
            try {
                return ObjectViewer.build(arg, null, state);
            } catch (err) {
                return HTML({ tag: 'span', style: { color: 'red' }, text: `[SHAT_ERR_${i}]` });
            }
        });

        // Handle total silence
        if (childManifestations.length === 0) {
            childManifestations.push(HTML({ 
                tag: 'span', 
                style: { fontStyle: 'italic', opacity: 0.5 }, 
                text: 'undefined' 
            }));
        }

        return HTML({
            className: 'dt-log-row',
            style: style,
            children: [
                // If it is the echoed Answer, we add the Return Port symbol
                isEcho ? { 
                    tag: 'span', 
                    style: { 
                        color: 'var(--neon-magenta)', 
                        marginRight: '10px', 
                        fontWeight: 'bold',
                        fontSize: '1.1em',
                        userSelect: 'none' 
                    }, 
                    text: '←' 
                } : null,
                ...childManifestations
            ]
        });
    }
};
