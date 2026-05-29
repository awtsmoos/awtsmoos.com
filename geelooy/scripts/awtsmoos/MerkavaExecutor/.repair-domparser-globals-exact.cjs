// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
`        globals() {
            const w = this.window;
            return { window: w, self: w, document: w.document, console: w.console, localStorage: w.localStorage, sessionStorage: w.sessionStorage,`,
`        globals() {
            const w = this.window;
            const Element = w.document.createElement('div').constructor;
            const Document = w.document.constructor;
            const DOMParser = class DOMParser {
                parseFromString(markup = '', type = 'text/html') {
                    const doc = new Document();
                    doc.body.innerHTML = String(markup || '');
                    return doc;
                }
            };
            return { window: w, self: w, document: w.document, console: w.console, localStorage: w.localStorage, sessionStorage: w.sessionStorage, DOMParser, Element, HTMLElement: Element, Document, Node: Element,`
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, domParser: text.includes('const DOMParser = class DOMParser'), element: text.includes('HTMLElement: Element') }, null, 2));
