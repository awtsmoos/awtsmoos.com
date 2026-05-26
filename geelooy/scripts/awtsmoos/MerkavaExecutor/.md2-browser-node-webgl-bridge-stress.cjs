// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, isMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    const EventEmitter = require('events').EventEmitter;
    let e = new EventEmitter();
    let seen = 0;
    e.on('pulse', function(v){ seen += v; });
    e.emit('pulse', 20);
    let canvas = document.createElement('canvas');
    canvas.id = 'arena';
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl');
    gl.viewport(0, 0, 128, 64);
    gl.clearColor(0.1, 0.2, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let clicks = 0;
    canvas.addEventListener('click', function(ev){ clicks += ev.type === 'click' ? 22 : 0; this.setAttribute('data-clicks', String(clicks)); });
    canvas.classList.add('stage', 'lit');
    canvas.classList.toggle('lit');
    canvas.setAttribute('style', 'color: green; margin-left: 9px');
    canvas.classList.add('stage', 'lit');
    canvas.classList.toggle('lit');
    canvas.setAttribute('style', 'color: green; margin-left: 9px');
    canvas.click();
    process.nextTick(function(){ seen += 1; });
    setImmediate(function(){ seen += 21; });
    __awtsmoosResult = {
      seen,
      clicks,
      dataClicks: canvas.dataset.clicks,
      glCommands: canvas.toJSON().webgl.commands.length,
      className: canvas.className,
      styleColor: getComputedStyle(canvas).getPropertyValue('color'),
      styleMargin: getComputedStyle(canvas)['margin-left'],
      pathOk: require('path').basename('/a/b.txt') === 'b.txt',
      urlOk: new (require('url').URL)('https://x.test/?q=42').searchParams.get('q') === '42'
    };
  `;
  const binary = await encodeMode2JsBinary(source);
  assert.ok(isMode2JsBinary(binary));
  const run = runMode2JsBinary(binary, { nodeCompat: true, globals: browser.globals() });
  assert.deepStrictEqual(run.result, {
    seen: 42,
    clicks: 22,
    dataClicks: '22',
    glCommands: 3,
    className: 'stage',
    styleColor: 'green',
    styleMargin: '9px',
    pathOk: true,
    urlOk: true
  });
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
