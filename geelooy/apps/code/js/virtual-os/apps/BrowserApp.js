// B"H
/**
 * @file BrowserApp.js
 * @description Embedded web tester for localhost and arbitrary URLs.
 */

export function renderBrowserApp(windowState, container) {
    const payload = windowState.payload || (windowState.payload = { url: 'http://localhost:3000' });
    container.innerHTML = `
        <div class="app-toolbar">
            <input class="browser-url" value="${payload.url}" placeholder="http://localhost:8080" />
            <button class="browser-go">Go</button>
        </div>
        <iframe class="browser-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" src="${payload.url}"></iframe>
    `;
    const input = container.querySelector('.browser-url');
    const frame = container.querySelector('.browser-frame');
    container.querySelector('.browser-go').onclick = () => {
        let url = input.value.trim();
        if (url && !/^https?:\/\//i.test(url)) url = `http://${url}`;
        payload.url = url;
        frame.src = url;
    };
}
