
// B"H
import { healTerminalPayload } from './terminal/payload.js';
import { renderTerminalDom } from './terminal/render.js';
import { runTerminalCommand } from './terminal/runner.js';

export function renderTerminalApp(windowState, container, desktopState, env) {
    const payload = healTerminalPayload(windowState, desktopState);
    renderTerminalDom(container, payload);

    const input = container.querySelector('.terminal-input');
    const runBtn = container.querySelector('.terminal-run');

    const run = async () => {
        const command = input.value.trim();
        if (!command) return;

        input.value = '';

        try {
            await runTerminalCommand(command, payload, env);
        } catch (error) {
            payload.lines.push(`Error: ${error.message || error}`);
        }

        env.requestRender();
    };

    runBtn.onclick = run;
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') run();
    });

    queueMicrotask(() => input.focus());
}
