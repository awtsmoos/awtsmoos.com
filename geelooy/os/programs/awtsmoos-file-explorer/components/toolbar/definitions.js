// B"H
export const TOOLBAR_GROUPS = Object.freeze({
  nav:[d('Back','back','Go back'),d('Forward','forward','Go forward'),d('Up','up','Parent folder'),d('Home','home','Home'),d('Refresh','refresh','Refresh files and tunnels')],
  create:[d('New File','newFile'),d('New Folder','newFolder'),d('Import','import')],
  edit:[d('Open','open'),d('Edit','edit'),d('Preview','preview'),d('Copy Path','copyPath')],
  clip:[d('Copy','copy'),d('Cut','cut'),d('Paste','paste'),d('Rename','rename'),d('Delete','delete')],
  select:[d('Select All','selectAll'),d('Clear','clearSelection')],
  view:[d('Icons','icons','Icons view','icons'),d('Details','details','Details view','details'),d('List','list','List view','list'),d('Tiles','tiles','Tiles view','tiles')],
  sort:[d('Sort Name','sortName'),d('Sort Type','sortType'),d('Sort Status','sortStatus'),d('Filter','filter','Apply current search filter')],
  tunnel:[d('Tunnels','tunnels'),d('Mounts','mounts'),d('Connect','connect'),d('Disconnect','disconnect')]
});
export const ALL_TOOLBAR_ACTIONS = Object.values(TOOLBAR_GROUPS).flat().map(x => x.action);
function d(label, action, title = label, mode = '') { return { label, action, title, mode }; }
/** B"H: one inventory names every Explorer button before it is rendered, including filter. */
