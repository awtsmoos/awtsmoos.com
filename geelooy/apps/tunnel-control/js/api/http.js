
// B"H

export async function getJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: options.credentials || "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    data = {
      BH: "B\"H",
      ok: false,
      error: "non_json_response",
      status: res.status,
      text
    };
  }

  if (!res.ok && data.ok !== false) {
    data.ok = false;
    data.status = res.status;
  }

  return data;
}
