// B"H
const fs = require('fs');
const path = require('path');

/** Count scratch bytes honestly before cleanup, so disk spill cannot hide. */
function dirBytes(root) {
  if (!root || !fs.existsSync(root)) return 0;
  let total = 0;
  for (const name of fs.readdirSync(root)) {
    const p = path.join(root, name);
    const st = fs.statSync(p);
    total += st.isDirectory() ? dirBytes(p) : st.size;
  }
  return total;
}

module.exports = { dirBytes };
