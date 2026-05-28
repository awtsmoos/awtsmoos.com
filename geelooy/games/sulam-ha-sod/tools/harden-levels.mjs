// B"H
import fs from 'node:fs';

const base = 'geelooy/games/sulam-ha-sod/js/data/levels';
const patches = {
  'level04-netzach.js': {
    tricks: "T(1160,340,70,16,'falseSpike'),T(2400,360,75,16,'phantom')",
    spike: "S(1760,486,65,24,1.4,1.1,2.4)"
  },
  'level05-gevurah.js': {
    tricks: "T(1380,258,70,16,'phantom'),T(2140,340,75,16,'falseSpike')",
    spike: "S(2940,486,70,24,1.3,1,2.2)"
  },
  'level06-tiferes.js': {
    tricks: "T(1740,326,75,16,'falseSpike'),T(2920,334,80,16,'phantom')",
    spike: "S(3920,486,75,24,1.2,1,2.1)"
  },
  'level07-chesed.js': {
    tricks: "T(1860,344,80,16,'falseSpike'),T(3180,232,78,16,'phantom')",
    spike: "S(4200,486,80,24,1.2,1,2.1)"
  },
  'level08-binah.js': {
    tricks: "T(1800,324,80,16,'falseSpike'),T(3200,214,80,16,'phantom')",
    spike: "S(3860,486,80,24,1.2,1,2.2)"
  },
  'level09-chochmah.js': {
    tricks: "T(2140,300,80,16,'falseSpike'),T(4200,272,85,16,'phantom')",
    spike: "S(5060,486,90,24,1.1,1,2)"
  },
  'level10-keter.js': {
    tricks: "T(2940,404,80,16,'phantom'),T(5120,284,88,16,'falseSpike')",
    spike: "S(5660,486,90,24,1.1,1,2)"
  },
  'level11-daas.js': {
    tricks: "T(2800,374,82,16,'falseSpike'),T(5140,224,90,16,'phantom')",
    spike: "S(6040,486,95,24,1.1,1,2)"
  },
  'level12-ayin.js': {
    tricks: "T(3000,404,82,16,'falseSpike'),T(5400,294,90,16,'phantom')",
    spike: "S(6500,486,95,24,1.1,1,2)"
  },
  'level13-atika.js': {
    tricks: "T(3180,404,84,16,'falseSpike'),T(5760,234,90,16,'phantom')",
    spike: "S(7020,486,100,24,1.1,1,2)"
  },
  'level14-einsof.js': {
    tricks: "T(3180,404,84,16,'falseSpike'),T(6200,304,92,16,'phantom')",
    spike: "S(7540,486,100,24,1.1,1.0,1.9)"
  }
};

for (const [file, patch] of Object.entries(patches)) {
  const path = `${base}/${file}`;
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes(patch.tricks)) {
    text = text.replace(/\],\r?\n\[C\(/, `,${patch.tricks}],\n[C(`);
  }
  if (!text.includes(patch.spike)) {
    text = text.replace(/\],\r?\n\[E\(/, `,${patch.spike}],\n[E(`);
  }
  fs.writeFileSync(path, text);
}

console.log('hardened levels 4-14');
