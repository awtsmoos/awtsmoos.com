// B"H
export const DEFAULT_DRIVES = Object.freeze([
  { id:"home", title:"Awtsmoos Home", root:"/", icon:"🏠", kind:"virtual", writable:true },
  { id:"virtual-os", title:"Virtual OS", root:"desktop.folder", icon:"🖥️", kind:"virtual", writable:true },
  { id:"tunnels", title:"Connected Tunnels", root:"awtsmoos://tunnels", icon:"🔌", kind:"remote", writable:false },
  { id:"previews", title:"Preview Artifacts", root:"awtsmoos://previews", icon:"🔭", kind:"remote", writable:false },
  { id:"receipts", title:"Receipts", root:"awtsmoos://receipts", icon:"🧾", kind:"remote", writable:false },
  { id:"missions", title:"Missions", root:"awtsmoos://missions", icon:"🧭", kind:"remote", writable:false }
]);
