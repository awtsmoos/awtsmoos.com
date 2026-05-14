// B"H

import {
  withWorldIdentity,
  isGitHubWorld,
  describeItemForError
} from '../../fs-provider/identity.js';

/**
 * @file commit-context.js
 * @description
 * B"H.
 *
 * Git commit code needs more than repoInfo and branch.
 * It needs a filesystem root whose provider identity is intact.
 *
 * This module is the guardian between the AI agent, the Git UI, the filesystem,
 * and GitHub. It ensures the local anchor update knows exactly which world
 * it belongs to before any remote commit is created.
 *
 * No more half-context commits.
 * No more pushing a partial chunk and then crashing while writing ikar.js.
 * No more undefined world type.
 */

/**
 * @function assertGitInfo
 * @description
 * B"H.
 *
 * Validates the Git remote information needed before any upload or commit.
 *
 * @param {object} gitInfo
 * Git metadata object.
 *
 * @returns {object}
 * The same gitInfo object.
 *
 * @throws {Error}
 * Throws if required Git fields are absent.
 */
export function assertGitInfo(gitInfo) {
  if (!gitInfo || typeof gitInfo !== "object") {
    throw new Error("[GitCommit] Missing gitInfo object.");
  }

  if (!gitInfo.repoInfo || typeof gitInfo.repoInfo !== "object") {
    throw new Error("[GitCommit] Missing gitInfo.repoInfo.");
  }

  if (!gitInfo.branch || typeof gitInfo.branch !== "string") {
    throw new Error("[GitCommit] Missing gitInfo.branch.");
  }

  return gitInfo;
}

/**
 * @function normalizeCommitContext
 * @description
 * B"H.
 *
 * Converts the incoming item into a stable Git context item.
 * This is the central repair for the stack trace:
 *
 * status-dialog.js
 * → core.js
 * → state.js
 * → metadata-rituals.js
 * → fs-provider.js
 *
 * The old path allowed item.type to be undefined.
 * This one refuses immediately with a useful diagnostic.
 *
 * @param {object} gitContextItem
 * The item passed by the Git status UI or AI agent.
 *
 * @param {object} gitInfo
 * Git metadata.
 *
 * @returns {object}
 * A stable context item with provider identity and workspace id.
 */
export function normalizeCommitContext(gitContextItem, gitInfo) {
  assertGitInfo(gitInfo);

  const context = withWorldIdentity(gitContextItem, {
    action: "prepare git commit context"
  });

  if (!context.path || typeof context.path !== "string") {
    throw new Error(
      `[GitCommit] Commit context is missing path. ` +
      `Diagnostic: ${describeItemForError(context)}`
    );
  }

  return {
    ...context,
    path: context.path.replace(/\/+$/, "") || "/",
    workspaceId: context.workspaceId || context.id || gitInfo.workspaceId || context.path
  };
}

/**
 * @function shouldWriteLocalAnchor
 * @description
 * B"H.
 *
 * GitHub provider items are already remote and do not need local ikar.js anchor
 * writes. Physical/local worlds do.
 *
 * @param {object} gitContextItem
 * Commit context item.
 *
 * @returns {boolean}
 * True when `.awtsmoos-repo/ikar.js` should be updated.
 */
export function shouldWriteLocalAnchor(gitContextItem) {
  return !isGitHubWorld(gitContextItem);
}

/**
 * @function normalizeChange
 * @description
 * B"H.
 *
 * Validates a single staged change.
 *
 * @param {object} change
 * A creation, update, or deletion record.
 *
 * @param {string} bucket
 * The change bucket name.
 *
 * @returns {object}
 * The normalized change.
 */
export function normalizeChange(change, bucket) {
  if (!change || typeof change !== "object") {
    throw new Error(`[GitCommit] ${bucket} contains a non-object change.`);
  }

  if (!change.path || typeof change.path !== "string") {
    throw new Error(`[GitCommit] ${bucket} change is missing path.`);
  }

  return {
    ...change,
    path: change.path.replace(/^\/+/, "")
  };
}

/**
 * @function normalizeChangeSet
 * @description
 * B"H.
 *
 * Normalizes staged creations, updates, and deletions.
 *
 * @param {object} changeSet
 * Raw change set from status UI or agent.
 *
 * @returns {{creations: object[], updates: object[], deletions: object[]}}
 * Normalized change set.
 */
export function normalizeChangeSet(changeSet = {}) {
  const creations = (changeSet.creations || []).map(change => normalizeChange(change, "creations"));
  const updates = (changeSet.updates || []).map(change => normalizeChange(change, "updates"));
  const deletions = (changeSet.deletions || []).map(change => normalizeChange(change, "deletions"));

  return { creations, updates, deletions };
}

/**
 * @function countChangeSet
 * @description
 * B"H.
 *
 * Counts all staged changes.
 *
 * @param {object} changeSet
 * Normalized change set.
 *
 * @returns {number}
 * Total changes.
 */
export function countChangeSet(changeSet) {
  return (
    (changeSet.creations || []).length +
    (changeSet.updates || []).length +
    (changeSet.deletions || []).length
  );
}

/**
 * @function assertNonEmptyChangeSet
 * @description
 * B"H.
 *
 * Refuses empty commits.
 *
 * @param {object} changeSet
 * Normalized change set.
 *
 * @returns {object}
 * The same change set.
 */
export function assertNonEmptyChangeSet(changeSet) {
  const total = countChangeSet(changeSet);

  if (!total) {
    throw new Error("[GitCommit] No staged file changes to commit.");
  }

  return changeSet;
}