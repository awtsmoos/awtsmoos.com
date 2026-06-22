// B"H
async function body($i) {
  const post = $i.$_POST || {};
  if (post.__raw_body__) {
    try { return JSON.parse(post.__raw_body__.toString('utf8')); } catch { return {}; }
  }
  return post;
}
module.exports = { body };
