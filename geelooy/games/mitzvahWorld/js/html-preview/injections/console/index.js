
/**
 * B"H
 * @module ConsoleAssembler
 */

import { DomPathLogic } from './DomPath.js';
import { SerializerLogic } from './Serializer.js';
import { BridgeLogic } from './Bridge.js';

export const ConsoleAssembler = {
    assemble() {
        return \`
            (function() {
                const origConsole = {
                    log: console.log.bind(console), error: console.error.bind(console),
                    warn: console.warn.bind(console), info: console.info.bind(console),
                    clear: console.clear.bind(console)
                };

                \${DomPathLogic}
                \${SerializerLogic}
                \${BridgeLogic}

                window.addEventListener('error', e => {
                    const err = e.error || { message: e.message, stack: "" };
                    console.error(\`[B"H Runtime Error] \${err.message}\`, err);
                });

                window.addEventListener('unhandledrejection', e => {
                    console.error('[B"H Promise Rejection]', e.reason);
                });
            })();
        \`;
    }
};
