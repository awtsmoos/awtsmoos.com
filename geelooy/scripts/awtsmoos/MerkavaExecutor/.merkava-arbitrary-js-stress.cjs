// B"H
const { RuntimeAssembler } = require('./merkava-runtime/RuntimeAssembler.js');

const cases = [
  {
    name: 'browser globals arithmetic dom console',
    runtime: 'browser',
    entry: 'main.js',
    files: {
      'main.js': `
        const button = document.createElement('button');
        button.id = 'gate';
        button.textContent = ['BH', 2 + 3 * 4].join(':');
        document.body.appendChild(button);
        window.__awtsmoosResult = { text: button.textContent, children: document.body.children.length };
        console.log('case1', window.__awtsmoosResult.text);
      `
    }
  },
  {
    name: 'closures classes arrays objects async',
    runtime: 'browser',
    entry: 'main.js',
    files: {
      'main.js': `
        class Vessel { constructor(x) { this.x = x; } rise(y) { return this.x + y; } }
        const make = base => async extra => new Vessel(base).rise(extra);
        const values = [1,2,3].map(x => x * x).reduce((a,b) => a + b, 0);
        window.__awtsmoosResult = { values, lifted: await make(10)(7) };
      `
    }
  },
  {
    name: 'module import export',
    runtime: 'browser',
    entry: 'main.js',
    module: true,
    files: {
      'main.js': `import { double } from './lib.js'; window.__awtsmoosResult = { doubled: double(21) };`,
      '/lib.js': `export function double(x) { return x * 2; }`
    }
  },
  {
    name: 'node fs virtual read',
    runtime: 'node',
    entry: 'main.js',
    files: {
      'main.js': `const txt = api.fs.readFileSync('data.txt', 'utf8'); globalThis.__awtsmoosResult = { txt, len: txt.length };`,
      'data.txt': 'letters of fire'
    }
  }
];

(async () => {
  const results = [];
  for (const test of cases) {
    try {
      const assembler = new RuntimeAssembler({ runtime: test.runtime, files: test.files, module: test.module });
      const out = await assembler.run(test.entry);
      results.push({
        name: test.name,
        ok: out.ok,
        value: out.runtime?.window?.__awtsmoosResult || globalThis.__awtsmoosResult || null,
        error: out.result?.error || null,
        logs: out.console || []
      });
      delete globalThis.__awtsmoosResult;
    } catch (error) {
      results.push({ name: test.name, ok: false, thrown: error.message, stack: error.stack });
    }
  }
  console.log(JSON.stringify(results, null, 2));
  if (results.some(r => !r.ok)) process.exit(1);
})();
