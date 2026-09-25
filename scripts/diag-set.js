// B"H — diagnose RAG_DATABASE_SET_CHANGED on production
const { expectedDatabaseNames } = require('/mnt/HC_Volume_102267213/git/awtsmoos.com/geelooy/api/social/helper/search/rag/storagePolicy.js');
const fs = require('fs');
const root = '/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag';
const dbs = fs.readdirSync(root).filter(f => f.endsWith('.awtsdb')).sort();
let exp;
try {
  exp = expectedDatabaseNames(root, dbs);
} catch (e) {
  console.log(JSON.stringify({ policyError: e.code || e.message }));
  process.exit(0);
}
console.log(JSON.stringify({
  actualCount: dbs.length,
  expectedCount: exp.length,
  match: JSON.stringify(dbs) === JSON.stringify(exp),
  onlyActual: dbs.filter(x => !exp.includes(x)),
  onlyExpected: exp.filter(x => !dbs.includes(x))
}));
