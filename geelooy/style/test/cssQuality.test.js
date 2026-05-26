// B"H
const assert = require('assert');
const fs = require('fs');

const cssFiles = [
  'geelooy/style/heichelos/revamped-partials/content.css',
  'geelooy/style/heichelos/revamped-partials/platform-panels.css',
  'geelooy/style/heichelos/revamped-partials/platform-mobile.css',
  'geelooy/style/heichelos/revamped-partials/notifications.css',
  'geelooy/style/heichelos/revamped-partials/notifications-mobile.css',
  'geelooy/style/social/alias.css',
  'geelooy/style/social/profileStyles.css',
  'geelooy/email/css/sidebar.css',
  'geelooy/email/css/composer.css'
];

assert.deepEqual(cssFiles, [...new Set(cssFiles)], 'cssQuality.test must not scan duplicate file paths');

for (const file of cssFiles) {
  const source = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /z-index:\s*999999/, `${file} has excessive z-index`);
  if (file.endsWith('profileStyles.css')) {
    assert.doesNotMatch(source, /(^|\n)\.hidden\s*\{/, `${file} has broad .hidden rule`);
  }

  const seen = new Set();
  const duplicates = [];
  const re = /([^{}@]+)\{([^{}]+)\}/g;
  let match;
  while ((match = re.exec(source))) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    if (!selector || selector === 'from' || selector === 'to') continue;
    const block = `${selector}{${match[2].trim().replace(/\s+/g, ' ')}}`;
    if (seen.has(block)) duplicates.push(selector);
    seen.add(block);
  }
  assert.deepEqual(duplicates, [], `${file} exact duplicate CSS blocks: ${duplicates.join(', ')}`);
}

console.log('B"H cssQuality.test passed');
