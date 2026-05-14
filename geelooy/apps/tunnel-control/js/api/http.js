
// B"H

export async function getJson(url) {
  const res = await fetch(url);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return { ok: false, raw: text };
  }
}

export async function postForm(url, data) {
  const body = new URLSearchParams();

  for (const [k, v] of Object.entries(data || {})) {
    body.set(k, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    body
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return { ok: false, raw: text };
  }
}
