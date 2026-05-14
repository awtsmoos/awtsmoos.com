
// B"H

export function b64Json(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

export function b64Text(value) {
  return btoa(unescape(encodeURIComponent(value || "")));
}
