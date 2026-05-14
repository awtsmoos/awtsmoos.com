// B"H

/**
 * @file phase-registry.js
 * @description
 * B"H.
 *
 * Data-first phase registry for the vibe-coding agent timeline.
 *
 * Instead of hardcoding scattered UI messages like "waiting first spark",
 * every state is declared here as data.
 *
 * The UI can render it collapsed.
 * The expanded panel can show details.
 * Tool calls can map into sane human language:
 * - reading file
 * - editing file
 * - creating file
 * - testing
 * - committing
 * - done
 * - error
 *
 * The Awtsmoos hides inside every phase as the One Source giving life to each
 * motion of the agent, but the code remains clean, modular, and predictable.
 */

/**
 * @constant {object} AGENT_PHASES
 * @description
 * B"H.
 *
 * Registry of visible agent phases.
 */
export const AGENT_PHASES = Object.freeze({
  idle: {
    label: "Ready",
    collapsed: true,
    tone: "neutral"
  },

  connecting: {
    label: "Connecting to the AI stream",
    collapsed: true,
    tone: "neutral"
  },

  thinking: {
    label: "Thinking",
    collapsed: false,
    tone: "active"
  },

  betweenThoughts: {
    label: "Receiving the next step",
    collapsed: true,
    tone: "active"
  },

  toolStart: {
    label: "Running tool",
    collapsed: true,
    tone: "active"
  },

  readFile: {
    label: "Reading file",
    collapsed: true,
    tone: "active"
  },

  editFile: {
    label: "Editing file",
    collapsed: true,
    tone: "active"
  },

  createFile: {
    label: "Creating file",
    collapsed: true,
    tone: "active"
  },

  deleteFile: {
    label: "Deleting file",
    collapsed: true,
    tone: "warning"
  },

  testStart: {
    label: "Testing changes",
    collapsed: true,
    tone: "active"
  },

  testPass: {
    label: "Tests passed",
    collapsed: true,
    tone: "success"
  },

  testFail: {
    label: "Tests failed",
    collapsed: false,
    tone: "error"
  },

  commitPrepare: {
    label: "Preparing commit",
    collapsed: true,
    tone: "active"
  },

  commitUpload: {
    label: "Preparing files for GitHub",
    collapsed: true,
    tone: "active"
  },

  commitRemote: {
    label: "Creating GitHub commit",
    collapsed: true,
    tone: "active"
  },

  commitDone: {
    label: "Commit complete",
    collapsed: true,
    tone: "success"
  },

  done: {
    label: "Finished",
    collapsed: true,
    tone: "success"
  },

  error: {
    label: "Error",
    collapsed: false,
    tone: "error"
  }
});

/**
 * @function phaseDefinition
 * @description
 * B"H.
 *
 * Gets a phase definition with fallback.
 *
 * @param {string} type
 * Phase type.
 *
 * @returns {object}
 * Phase definition.
 */
export function phaseDefinition(type) {
  return AGENT_PHASES[type] || {
    label: type || "Working",
    collapsed: true,
    tone: "neutral"
  };
}

/**
 * @function labelForToolCall
 * @description
 * B"H.
 *
 * Converts tool names and arguments into useful collapsed labels.
 *
 * @param {string} toolName
 * Tool/function name.
 *
 * @param {object} args
 * Tool arguments.
 *
 * @returns {{type: string, label: string}}
 * Phase type and label.
 */
export function labelForToolCall(toolName, args = {}) {
  const name = String(toolName || "").toLowerCase();
  const file = args.path || args.file || args.filePath || args.targetPath || args.name;

  if (name.includes("read")) {
    return {
      type: "readFile",
      label: file ? `Reading ${file}` : "Reading file"
    };
  }

  if (name.includes("write") || name.includes("edit") || name.includes("patch")) {
    return {
      type: args.kind === "new" ? "createFile" : "editFile",
      label: file ? `Editing ${file}` : "Editing file"
    };
  }

  if (name.includes("create")) {
    return {
      type: "createFile",
      label: file ? `Creating ${file}` : "Creating file"
    };
  }

  if (name.includes("delete") || name.includes("remove")) {
    return {
      type: "deleteFile",
      label: file ? `Deleting ${file}` : "Deleting file"
    };
  }

  if (name.includes("test") || name.includes("run")) {
    return {
      type: "testStart",
      label: "Testing changes"
    };
  }

  if (name.includes("commit") || name.includes("github") || name.includes("git")) {
    return {
      type: "commitPrepare",
      label: "Preparing commit"
    };
  }

  return {
    type: "toolStart",
    label: toolName ? `Running ${toolName}` : "Running tool"
  };
}