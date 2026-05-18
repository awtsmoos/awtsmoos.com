// B"H
/**
 * @file AutoPreviewLauncher.js
 * @brief Adds an automatic virtual preview URL after generated files settle.
 */

import { ToolExecutor } from '../../agent/ToolExecutor.js';

const WRITE_TOOLS = new Set([
    'engrave_vessel',
    'apply_patch',
    'replace_range'
]);

function hasWriteIntent(toolCalls = []) {
    return toolCalls.some(call => WRITE_TOOLS.has(call?.function?.name));
}

function alreadyLaunched(toolCalls = []) {
    return toolCalls.some(call => call?.function?.name === 'launch_preview');
}

export const AutoPreviewLauncher = {
    async maybeLaunch({ tab, toolCalls, lastMsg }) {
        if (!hasWriteIntent(toolCalls) || alreadyLaunched(toolCalls)) {
            return null;
        }

        const raw = await ToolExecutor.execute('launch_preview', { project_path: '/' }, tab, null);
        const text = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);

        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) {}

        if (!parsed?.url) return null;

        const block = [
            '',
            '---',
            '',
            `Preview URL: ${parsed.url}`,
            '',
            `Preview id: ${parsed.id}`,
            `Runtime: ${parsed.kind || 'unknown'}${parsed.type ? ` / ${parsed.type}` : ''}`
        ].join('\n');

        lastMsg.content += block;
        tab.vibeSession.history.push({
            role: 'assistant',
            content: block
        });

        return parsed;
    }
};
