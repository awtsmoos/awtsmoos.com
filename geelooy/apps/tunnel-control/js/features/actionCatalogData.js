// B"H
import { AUTOMATION_ACTIONS } from './actionCatalog/automationActions.js';
import { FAKE_SSH_ACTIONS } from './actionCatalog/fakeSshActions.js';
import { FILE_ACTIONS } from './actionCatalog/fileActions.js';
import { MISSION_ACTIONS } from './actionCatalog/missionActions.js';
import { REMOTE_DESKTOP_ACTIONS } from './actionCatalog/remoteDesktopActions.js';
import { REMOTE_DRIVE_ACTIONS } from './actionCatalog/remoteDriveActions.js';
import { REMOTE_PREVIEW_ACTIONS } from './actionCatalog/remotePreviewActions.js';
import { VIRTUAL_OS_ACTIONS } from './actionCatalog/virtualOsActions.js';

/**
 * B"H
 * The control catalog is no longer one crowded tablet. Each family sings from
 * a small module, then gathers here into the same public ACTION_CATALOG vessel
 * used by the UI. Through that simple gathering, the Awtsmoos reveals the VFS
 * gates beside graph, preview, mission, and automation gates: one surface, one
 * responsibility, no duplicated OS.
 */
export const ACTION_CATALOG = Object.freeze([
  ...FILE_ACTIONS,
  ...REMOTE_PREVIEW_ACTIONS,
  ...REMOTE_DRIVE_ACTIONS,
  ...FAKE_SSH_ACTIONS,
  ...REMOTE_DESKTOP_ACTIONS,
  ...VIRTUAL_OS_ACTIONS,
  ...MISSION_ACTIONS,
  ...AUTOMATION_ACTIONS
]);
