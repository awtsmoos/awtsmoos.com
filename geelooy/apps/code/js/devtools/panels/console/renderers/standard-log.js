
// B"H
/**
 * @file standard-log.js
 * @brief Renders system output logs.
 */

import { HTML } from '../../../../html-generator.js';
import { ObjectViewer } from '../object-viewer.js';
import { LogStyles } from './styles.js';

export const StandardLogRenderer = {
    render(log) {
        let style = { ...LogStyles.base };
        
        if (log.level === 'error') {
            Object.assign(style, LogStyles.error);
        } else if (log.level === 'warn') {
            Object.assign(style, LogStyles.warn);
        } else {
            Object.assign(style, LogStyles.log);
        }

        const children = log.args.map(arg => ObjectViewer.build(arg));

        return HTML({ style, children });
    }
};
