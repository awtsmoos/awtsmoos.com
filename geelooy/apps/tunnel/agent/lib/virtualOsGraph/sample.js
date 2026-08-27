// B"H
const Registry = require('./registry.js');
function sample() {
  const g = Registry.create();
  g.upsert({ id:'desktop:main', type:'desktop', title:'Geelooy Desktop', path:'/desktop', children:['drive:tunnels','drive:previews','session:ai'] });
  g.upsert({ id:'drive:tunnels', type:'drive', title:'Connected Tunnels', url:'awtsmoos://tunnels', parentId:'desktop:main', refs:['session:ai'] });
  g.upsert({ id:'drive:previews', type:'drive', title:'Preview Artifacts', url:'awtsmoos://previews', parentId:'desktop:main' });
  g.upsert({ id:'session:ai', type:'session', title:'AI OS User', path:'/users/ai', data:{ roles:['read','write','preview','mission'] } });
  g.upsert({ id:'process:graph-sync', type:'process', title:'Graph Sync Process', parentId:'session:ai', refs:['desktop:main'] });
  return g;
}
/**
 * B"H
 * The sample is a small dawn: desktop, drives, AI session, sync process.
 * It is not the whole palace, only a flame held up so the next traveler sees
 * how refs, parents, children, paths, and permissions now speak together.
 */
module.exports = { sample };
