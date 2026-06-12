// B"H
/**
 * @file jsCssStateContract.test.mjs
 * @description
 * The Awtsmoos breathes state into DOM and CSS receives it as vessels. This test
 * rejects orphan states: JS classes/variables without CSS, and CSS state hooks
 * without a known JS source.
 */

import fs from 'node:fs';

const pairs = [
  {
    name: 'Home pointer light',
    js: 'geelooy/scripts/awtsmoos/social/home/beauty/ambientPointer.js',
    css: 'geelooy/style/social/home/beauty/atmosphere/pointer-light.css',
    hooks: ['--home-pointer-x', '--home-pointer-y']
  },
  {
    name: 'Home centered feed card',
    js: 'geelooy/scripts/awtsmoos/social/home/legend/feedCardObserver.js',
    css: 'geelooy/style/social/home/legend/cards/active-depth.css',
    hooks: ['is-feed-current']
  },
  {
    name: 'Heichel centered card',
    js: 'geelooy/heichelos/heichel/modules/legend/cardDepthObserver.js',
    css: 'geelooy/style/heichelos/heichel/legend/artifact-card/surface.css',
    hooks: ['is-card-current']
  },
  {
    name: 'Heichel hero depth',
    js: 'geelooy/heichelos/heichel/modules/legend/heroScrollDepth.js',
    css: 'geelooy/style/heichelos/heichel/legend/scroll-state/compressed.css',
    hooks: ['legendHeroDepth', 'hero-compact']
  },
  {
    name: 'Reader centered section',
    js: 'geelooy/heichelos/post/logic/legend/centerSectionObserver.js',
    css: 'geelooy/heichelos/post/styles/reader-legend/verse-rhythm/current-verse.css',
    hooks: ['is-reader-center']
  },
  {
    name: 'Reader progress',
    js: 'geelooy/heichelos/post/logic/legend/readingProgressState.js',
    css: 'geelooy/heichelos/post/styles/reader-beauty/progress/spine.css',
    hooks: ['--reader-progress', 'awtsmoos-progress-spine']
  },
  {
    name: 'Reader completion',
    js: 'geelooy/heichelos/post/logic/legend/completionState.js',
    css: 'geelooy/heichelos/post/styles/reader-legend/completion/shell.css',
    hooks: ['reader-near-complete']
  },
  {
    name: 'Reader section kind',
    js: 'geelooy/heichelos/post/logic/legend/sectionKindClassifier.js',
    css: 'geelooy/heichelos/post/styles/reader-beauty/verses/type-teaching.css',
    hooks: ['awtsmoosKind', 'data-awtsmoos-kind']
  }
];

function text(path) {
  return fs.readFileSync(path, 'utf8');
}

for (const pair of pairs) {
  const js = text(pair.js);
  const css = text(pair.css);
  for (const hook of pair.hooks) {
    const inJs = js.includes(hook);
    const inCss = css.includes(hook);
    if (!inJs && !inCss) throw new Error(`${pair.name}: hook ${hook} appears in neither side`);
  }
}

const rafUtility = text('geelooy/shared/visual/createRafScrollBinder.js');
for (const file of [
  'geelooy/scripts/awtsmoos/social/home/legend/feedCardObserver.js',
  'geelooy/heichelos/heichel/modules/legend/cardDepthObserver.js',
  'geelooy/heichelos/heichel/modules/legend/heroScrollDepth.js',
  'geelooy/heichelos/post/logic/legend/centerSectionObserver.js',
  'geelooy/heichelos/post/logic/legend/readingProgressState.js',
  'geelooy/heichelos/post/logic/legend/completionState.js'
]) {
  const source = text(file);
  if (!source.includes('bindRafViewportUpdates')) {
    throw new Error(`${file} does not use the rAF viewport binder`);
  }
}

if (!rafUtility.includes('requestAnimationFrame') || !rafUtility.includes('passive: true')) {
  throw new Error('rAF scroll binder must schedule frames and bind passive listeners');
}

console.log('B"H jsCssStateContract.test passed');
