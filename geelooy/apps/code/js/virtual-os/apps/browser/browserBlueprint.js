
// B"H
/**
 * @file browserBlueprint.js
 * @description
 * JSON blueprint for Virtual Browser.
 */

export function browserBlueprint(payload) {
    const consoleHidden = payload.consoleHidden ? ' vos-browser-console-hidden' : '';

    return {
        tag: 'div',
        className: `vos-app vos-browser-app${consoleHidden}`,
        children: [
            {
                tag: 'div',
                className: 'vos-app-toolbar vos-browser-toolbar',
                children: [
                    { tag: 'button', className: 'vos-app-button', text: '←', dataset: { action: 'back' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: '↻', dataset: { action: 'reload' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: 'Home', dataset: { action: 'home' }, attrs: { type: 'button' } },
                    { tag: 'input', className: 'vos-app-input vos-browser-address', value: payload.url || 'about:blank' },
                    { tag: 'button', className: 'vos-app-button', text: 'Go', dataset: { action: 'go' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: 'Console', dataset: { action: 'console' }, attrs: { type: 'button' } }
                ]
            },
            {
                tag: 'div',
                className: 'vos-browser-frame-wrap',
                children: [
                    { tag: 'iframe', className: 'vos-browser-frame', attrs: { sandbox: 'allow-scripts allow-forms allow-same-origin allow-popups allow-modals' } },
                    {
                        tag: 'div',
                        className: 'vos-browser-console',
                        children: [
                            { tag: 'div', className: 'vos-browser-console-head', text: 'Console' },
                            { tag: 'div', className: 'vos-browser-console-lines' }
                        ]
                    }
                ]
            }
        ]
    };
}
