// B"H
import fs from 'node:fs';

const ownership = {
  'geelooy/style/heichelos/heichel/hero.css': ['.heichel-mobile-topbar', '.hero-stats'],
  'geelooy/style/heichelos/heichel/search.css': ['.series-heading'],
  'geelooy/style/heichelos/heichel/bottom-nav.css': ['#bulk-actions-bar'],
  'geelooy/style/heichelos/heichel/series-list.css': ['.nav-card {', '.card-menu-panel'],
  'geelooy/style/heichelos/heichel/mobile.css': ['.nav-card {', '.hero-stats']
};

const violations = [];
for (const [file, forbidden] of Object.entries(ownership)) {
  const text = fs.readFileSync(file, 'utf8');
  forbidden.forEach(pattern => {
    if (text.includes(pattern)) violations.push(`${file} still owns ${pattern}`);
  });
}

if (violations.length) {
  throw new Error('Heichel duplicate ownership remains: ' + violations.join('; '));
}
console.log('B"H heichelNoDuplicateOwnership.test passed');
