// B"H
import { toast, fail } from './toast.js';
import { newFile } from './newFile.js';
import { newFolder } from './newFolder.js';
import { removeSelected } from './remove.js';
import { copySelected } from './copy.js';
import { cutSelected } from './cut.js';
import { pasteIntoCurrent } from './paste.js';
import { renameSelected } from './rename.js';
import { selectAll, clearSelection } from './select.js';
import { openSelected } from './open.js';
import { editSelected } from './edit.js';
import { previewSelected } from './preview.js';
import { copyPath } from './copyPath.js';
import { goHome, goUp, goBack, goForward } from './navigation.js';
import { refreshExplorer } from './refresh.js';
import { setViewMode } from './viewMode.js';
import { sortBy } from './sortAction.js';
import { filterBy } from './filterAction.js';
import { openTunnels, openMounts, connectTunnel, disconnectTunnel } from './tunnels.js';
import { importIntoCurrent } from './importAction.js';
export const ACTION_NAMES = ['newFile','newFolder','import','delete','copy','cut','paste','rename','selectAll','clearSelection','open','edit','preview','copyPath','home','up','back','forward','refresh','icons','details','list','tiles','sortName','sortType','sortStatus','filter','tunnels','mounts','connect','disconnect'];
export function registerExplorerActions(controller, ctx) {
  const map = { newFile:p => named(ctx,p,'New File',newFile), newFolder:p => named(ctx,p,'New Folder',newFolder), import:p => named(ctx,p,'Import',importIntoCurrent), delete:p => named(ctx,p,'Delete',removeSelected), copy:p => named(ctx,p,'Copy',copySelected), cut:p => named(ctx,p,'Cut',cutSelected), paste:p => named(ctx,p,'Paste',pasteIntoCurrent), rename:p => named(ctx,p,'Rename',renameSelected), selectAll:p => named(ctx,p,'Select All',selectAll), clearSelection:p => named(ctx,p,'Clear Selection',clearSelection), open:p => named(ctx,p,'Open',openSelected), edit:p => named(ctx,p,'Edit',editSelected), preview:p => named(ctx,p,'Preview',previewSelected), copyPath:p => named(ctx,p,'Copy Path',copyPath), home:p => named(ctx,p,'Home',goHome), up:p => named(ctx,p,'Up',goUp), back:p => named(ctx,p,'Back',goBack), forward:p => named(ctx,p,'Forward',goForward), refresh:p => named(ctx,p,'Refresh',refreshExplorer), icons:p => mode(ctx,p,'icons'), details:p => mode(ctx,p,'details'), list:p => mode(ctx,p,'list'), tiles:p => mode(ctx,p,'tiles'), sortName:p => sort(ctx,p,'name'), sortType:p => sort(ctx,p,'type'), sortStatus:p => sort(ctx,p,'status'), filter:p => named(ctx,p,'Filter',filterBy), tunnels:p => named(ctx,p,'Tunnels',openTunnels), mounts:p => named(ctx,p,'Mounts',openMounts), connect:p => named(ctx,p,'Connect',connectTunnel), disconnect:p => named(ctx,p,'Disconnect',disconnectTunnel) };
  ACTION_NAMES.forEach(name => controller.command.register(name, payload => map[name]?.(payload || {}))); return map;
}
async function named(ctx, payload, label, fn) { const full = { ...ctx, ...(payload || {}) }; try { const got = await fn(full); toast(ctx.system, `${label} complete`, 'success'); ctx.afterAction?.(); return got; } catch (e) { fail(ctx.system, label, e); throw e; } }
async function mode(ctx, payload, value) { return await named(ctx, payload, `View ${value}`, c => setViewMode(c, value)); }
async function sort(ctx, payload, by) { return await named(ctx, payload, `Sort ${by}`, c => sortBy(c, by)); }
/** B"H: every toolbar button receives a named command and payloads flow honestly. */
