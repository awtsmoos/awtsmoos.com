// B"H
/**
 * @file staleVisualModuleDetector.test.mjs
 * @description
 * A first gate against decorative dust. The Awtsmoos does not need placeholder
 * vessels; every new visual contract touched in this pass must contain actual
 * selectors, imports, or executable behavior rather than empty ceremony.
 */

import fs from 'node:fs';

const requiredSubstance = [
  'geelooy/shared/visual/createRafScrollBinder.js',
  'geelooy/shared/visual/findCenteredElement.js',
  'geelooy/scripts/awtsmoos/social/home/beauty/ambientPointer.js',
  'geelooy/scripts/awtsmoos/social/home/legend/feedCardObserver.js',
  'geelooy/heichelos/heichel/modules/legend/cardDepthObserver.js',
  'geelooy/heichelos/heichel/modules/legend/heroScrollDepth.js',
  'geelooy/heichelos/post/logic/legend/centerSectionObserver.js',
  'geelooy/heichelos/post/logic/legend/readingProgressState.js',
  'geelooy/heichelos/post/logic/legend/completionState.js',
  'geelooy/heichelos/post/logic/legend/sectionKindClassifier.js',
  'geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js'
];

for (const file of requiredSubstance) {
  const source = fs.readFileSync(file, 'utf8');
  const codeLines = source
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//') && !line.startsWith('*') && !line.startsWith('/**'));

  if (codeLines.length < 8) {
    throw new Error(`${file} has too little executable substance`);
  }
  if (/TODO|placeholder|stub|implement later/i.test(source)) {
    throw new Error(`${file} contains placeholder language`);
  }
}

const scrollBinderConsumers = requiredSubstance
  .filter(file => file.includes('/legend/') && !file.endsWith('sectionKindClassifier.js'))
  .filter(file => fs.readFileSync(file, 'utf8').includes('scroll'));

for (const file of scrollBinderConsumers) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('bindRafViewportUpdates')) {
    throw new Error(`${file} performs scroll work without shared rAF binder`);
  }
}

console.log('B"H staleVisualModuleDetector.test passed');
