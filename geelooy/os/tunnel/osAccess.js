// B"H
import { actionCatalog, actionNames, commandRunTemplate, findAction } from './actionCatalog.js';
import { buildTunnelCommandRequest, tunnelVirtualList, tunnelVirtualRead } from './virtualTunnelFs.js';

/** B"H: access helpers keep handlers from chanting window.os again and again. */
export function currentOs() { return window.os || {}; }
export function currentGraph() { return currentOs().graph || {}; }
export const tunnelActions = actionCatalog;
export const tunnelActionNames = actionNames;
export const tunnelAction = findAction;
export const nativeCommandPayload = commandRunTemplate;
export const tunnelFs = Object.freeze({ list: tunnelVirtualList, read: tunnelVirtualRead, buildCommandRequest: buildTunnelCommandRequest });
