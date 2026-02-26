
// B"H
/**
 * @file consoleOutputSchema.js
 * @brief JSON blueprints for the output area.
 */

export const OutputWrapperSchema = {
    className: 'dt-console-output-wrapper',
    style: { flexGrow: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
};

export const LogContainerSchema = {
    className: 'dt-console-logs',
    style: { flexGrow: '1', overflowY: 'auto', padding: '10px', fontFamily: 'var(--font-code)', fontSize: '13px' }
};

export const LogRowSchema = {
    style: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '4px 0', wordBreak: 'break-word' }
};
