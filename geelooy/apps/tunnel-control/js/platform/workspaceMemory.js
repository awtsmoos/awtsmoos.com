// B"H

const KEY = "awt-workspace-memory";

export function loadWorkspaceMemory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveWorkspaceMemory(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function remember(key, value) {
  const memory = loadWorkspaceMemory();
  memory[key] = value;
  saveWorkspaceMemory(memory);
}
