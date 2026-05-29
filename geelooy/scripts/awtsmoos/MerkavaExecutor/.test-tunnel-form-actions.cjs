// B"H
const { simulate, requireTruth } = require('./.test-tunnel-simulate-runtime-helpers.cjs');

/**
 * Chapter 3: The form bones began to sing.
 * Each input is touched by Puppeteer-like hands inside Merkava only: check,
 * uncheck, selectOption, focus, blur, clear, press, keyboard, mouse.
 */
(async () => {
  const html = `<!doctype html><title>Form Stress</title>
    <input id="name"><input id="flag" type="checkbox">
    <select id="choice"><option value="a">A</option><option value="b">B</option></select>
    <button id="btn">Hit</button><output id="out"></output>
    <script>document.querySelector('#btn').addEventListener('click',()=>{document.querySelector('#out').textContent=document.querySelector('#name').value+':'+document.querySelector('#choice').value+':'+document.querySelector('#flag').checked;});</script>`;
  const actions = [
    { action: 'focus', selector: '#name' },
    { action: 'fill', selector: '#name', text: 'Aleph' },
    { action: 'press', selector: '#name', key: '!' },
    { action: 'clear', selector: '#name' },
    { action: 'type', selector: '#name', text: 'Awtsmoos' },
    { action: 'keyboard.down', key: 'Shift' },
    { action: 'keyboard.up', key: 'Shift' },
    { action: 'mouse.move', x: 7, y: 9 },
    { action: 'mouse.down' },
    { action: 'mouse.up' },
    { action: 'check', selector: '#flag' },
    { action: 'uncheck', selector: '#flag' },
    { action: 'check', selector: '#flag' },
    { action: 'select', selector: '#choice', value: 'b' },
    { action: 'hover', selector: '#btn' },
    { action: 'doubleClick', selector: '#btn' },
    { action: 'blur', selector: '#name' },
    { action: 'assertValue', selector: '#name', expected: 'Awtsmoos' },
    { action: 'assertChecked', selector: '#flag', expected: true },
    { action: 'assertText', selector: '#out', expected: 'Awtsmoos:b:true' }
  ];
  const result = await simulate({ html, actions: JSON.stringify(actions), returnValues: JSON.stringify(['document.querySelector("#out").textContent', 'document.querySelector("#choice").value', 'document.querySelector("#flag").checked']) });
  const evidence = { ok: result.ok, values: result.values, log: result.interactionLog?.map(x => ({ action: x.action, ok: x.ok, value: x.value, error: x.error })) };
  console.log(JSON.stringify(evidence, null, 2));
  requireTruth(result.ok, 'form actions all ok', evidence);
  requireTruth(result.values?.['document.querySelector("#out").textContent'] === 'Awtsmoos:b:true', 'output text', evidence);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
