// B"H
import { action } from './action.js';

/** B"H: remote drive entries expose guarded reading, not mutation. */
export const REMOTE_DRIVE_ACTIONS = Object.freeze([
  action('remoteDriveList', 'Remote drives', 'List owner-scoped read-only mounted roots.', 'Remote Drive', ['safe'], {}),
  action('remoteDriveTree', 'Remote drive tree', 'Browse a bounded tree through the drive guard.', 'Remote Drive', ['safe'], { path:'.', depth:2, limit:120 }),
  action('remoteDriveRead', 'Remote drive read', 'Read a non-secret file through the drive guard.', 'Remote Drive', ['safe'], { path:'README.md' })
]);
