
// B"H

export const $ = id => document.getElementById(id);

export function text(id, value) {
  $(id).textContent = value;
}

export function jsonText(id, value) {
  text(id, JSON.stringify(value, null, 2));
}
