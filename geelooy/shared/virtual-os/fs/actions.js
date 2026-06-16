// B"H
/**
 * B"H
 * Chapter 40: Many filesystem verbs bowed into one alphabet.
 */
export const VIRTUAL_FS_ACTIONS = Object.freeze({
  LIST: "list",
  TREE: "tree",
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  MAKE_FOLDER: "makeFolder",
  BULK: "bulk",
  COMMAND_RUN: "commandRun"
});

const ACTION_ALIASES = Object.freeze({
  ls: VIRTUAL_FS_ACTIONS.LIST,
  dir: VIRTUAL_FS_ACTIONS.LIST,
  mkdir: VIRTUAL_FS_ACTIONS.MAKE_FOLDER,
  makeDirectory: VIRTUAL_FS_ACTIONS.MAKE_FOLDER,
  rm: VIRTUAL_FS_ACTIONS.DELETE,
  del: VIRTUAL_FS_ACTIONS.DELETE,
  cat: VIRTUAL_FS_ACTIONS.READ,
  command: VIRTUAL_FS_ACTIONS.COMMAND_RUN,
  shellCommand: VIRTUAL_FS_ACTIONS.COMMAND_RUN,
  run_terminal_command: VIRTUAL_FS_ACTIONS.COMMAND_RUN
});

export function normalizeVirtualFsAction(action = "list") {
  const text = String(action || "list").trim();
  return ACTION_ALIASES[text] || text || VIRTUAL_FS_ACTIONS.LIST;
}

export function isWriteAction(action = "") {
  return [VIRTUAL_FS_ACTIONS.WRITE, VIRTUAL_FS_ACTIONS.DELETE, VIRTUAL_FS_ACTIONS.MAKE_FOLDER].includes(normalizeVirtualFsAction(action));
}

export function isReadAction(action = "") {
  return [VIRTUAL_FS_ACTIONS.LIST, VIRTUAL_FS_ACTIONS.TREE, VIRTUAL_FS_ACTIONS.READ, VIRTUAL_FS_ACTIONS.BULK].includes(normalizeVirtualFsAction(action));
}

export function availableVirtualFsActions() {
  return Object.values(VIRTUAL_FS_ACTIONS);
}
