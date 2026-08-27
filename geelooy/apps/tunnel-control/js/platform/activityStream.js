// B"H

const stream = [];

export function pushActivity(entry) {
  stream.unshift({ ...entry, timestamp: Date.now() });
  stream.splice(50);
}

export function readActivity() {
  return [...stream];
}
