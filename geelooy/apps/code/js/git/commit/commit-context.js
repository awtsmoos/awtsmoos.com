// B"H
import {
  withWorldIdentity,
  isGitHubWorld,
  describeItemForError,
  normalizeWorldType
} from '../../fs-provider/identity.js';
import { State } from '../../state.js';

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

function findWorkspaceForCommit(gitContextItem, gitInfo) {
  const workspaceId =
    gitContextItem?.workspaceId ||
    gitContextItem?.id ||
    gitInfo?.workspaceId;

  if (!workspaceId || !Array.isArray(State.workspaces)) return null;

  return State.workspaces.find(workspace =>
    String(workspace.id) === String(workspaceId)
  ) || null;
}

function recoverCommitWorldIdentity(gitContextItem, gitInfo) {
  const workspace = findWorkspaceForCommit(gitContextItem, gitInfo);
  const recoveredType = normalizeWorldType(
    gitContextItem?.originalType ||
    gitContextItem?.type ||
    workspace?.originalType ||
    workspace?.type
  );

  return {
    ...(workspace || {}),
    ...(gitContextItem || {}),
    type: recoveredType || gitContextItem?.type,
    originalType: recoveredType || gitContextItem?.originalType,
    workspaceId:
      gitContextItem?.workspaceId ||
      gitContextItem?.id ||
      gitInfo?.workspaceId ||
      workspace?.id
  };
}

export function normalizeCommitContext(gitContextItem, gitInfo) {
  assertGitInfo(gitInfo);

  const recovered = recoverCommitWorldIdentity(gitContextItem, gitInfo);
  const context = withWorldIdentity(recovered, {
    action: "prepare git commit context"
  });

  if (!context.path || typeof context.path !== "string") {
    throw new Error(
      `[GitCommit] Commit context is missing path.\n` +
      `Diagnostic: ${describeItemForError(context)}`
    );
  }

  return {
    ...context,
    path: context.path.replace(/\/+$/, "") || "/",
    workspaceId:
      context.workspaceId ||
      context.id ||
      gitInfo.workspaceId ||
      context.path
  };
}

export function shouldWriteLocalAnchor(gitContextItem) {
  return !isGitHubWorld(gitContextItem);
}

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

export function normalizeChangeSet(changeSet = {}) {
  const creations = (changeSet.creations || []).map(change =>
    normalizeChange(change, "creations")
  );

  const updates = (changeSet.updates || []).map(change =>
    normalizeChange(change, "updates")
  );

  const deletions = (changeSet.deletions || []).map(change =>
    normalizeChange(change, "deletions")
  );

  return { creations, updates, deletions };
}

export function countChangeSet(changeSet) {
  return (
    (changeSet.creations || []).length +
    (changeSet.updates || []).length +
    (changeSet.deletions || []).length
  );
}

export function assertNonEmptyChangeSet(changeSet) {
  const total = countChangeSet(changeSet);

  if (!total) {
    throw new Error("[GitCommit] No staged file changes to commit.");
  }

  return changeSet;
}