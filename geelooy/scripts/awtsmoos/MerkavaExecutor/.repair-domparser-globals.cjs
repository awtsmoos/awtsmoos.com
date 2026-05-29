// B"H
const fs = require('fs');
const runtimeFile = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js';
const hostFile = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');
runtime = runtime.replace(
`            const w = this.window;
            return { window: w, self: w, document: w.document, console: w.console, localStorage: w.localStorage, sessionStorage: w.sessionStorage,`,
`            const w = this.window;
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
fs.writeFileSync(runtimeFile, runtime);
let host = fs.readFileSync(hostFile, 'utf8');
host = host.replace(
`    const instance = { __kind: 'instance', __class: klass, fields: {} };
    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, { this: instance });`,
`    if (!klass) throw new TypeError('Merkava cannot construct undefined as a class');
    const instance = { __kind: 'instance', __class: klass, fields: {} };
    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, { this: instance });`
);
fs.writeFileSync(hostFile, host);
console.log(JSON.stringify({ ok: true, domParser: runtime.includes('class DOMParser'), constructGuard: host.includes('cannot construct undefined') }, null, 2));
