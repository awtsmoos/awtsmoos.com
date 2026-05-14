
// B"H

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

async function body($i) {
  try {
    if ($i.request.method !== "POST") return {};
    await $i.getPostData();
    return $i.paramKinds?.POST || $i.$_POST || {};
  } catch (e) {
    return {};
  }
}

module.exports = { query, body };
