// B"H
export const ROOT_MOUNTS = Object.freeze([
  { id:"root", title:"Awtsmoos Root", path:"/", provider:"virtual", icon:"א" },
  { id:"home", title:"Home", path:"/home", provider:"virtual", icon:"🏠" },
  { id:"desktop", title:"Desktop", path:"/desktop", provider:"virtual", icon:"🖥️" },
  { id:"drives", title:"Drives", path:"/drives", provider:"virtual", icon:"💽" },
  { id:"network", title:"Network", path:"/network", provider:"virtual", icon:"🌐" },
  { id:"aliases", title:"Aliases", path:"/aliases", provider:"virtual", icon:"🔗" },
  { id:"projects", title:"Projects", path:"/projects", provider:"virtual", icon:"🧰" },
  { id:"memory", title:"Memory", path:"/memory", provider:"memory", icon:"🧠" },
  { id:"system", title:"System", path:"/system", provider:"virtual", icon:"⚙️" },
  { id:"users", title:"Users", path:"/users", provider:"virtual", icon:"👥" }
]);

export function mountPath(...parts) {
  return `/${parts.filter(Boolean).join("/")}`.replace(/\/+/g, "/");
}

/** B"H: the root tree is not storage; it is the map by which storage appears. */
