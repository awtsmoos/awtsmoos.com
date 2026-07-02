// B"H
export function deviceDrive(device = {}) {
  const vessel = device.vesselType || device.kind || (device.syntheticTunnel ? "virtual-os" : "tunnel");
  const provider = vessel === "virtual-os" ? "virtual" : "tunnel";
  const name = device.tunnelName || "unknown";
  return { id:`network-${name}`, title:device.deviceName || name, root:`/network/${name}`, url:`awtsmoos://network/${name}`, icon:provider === "virtual" ? "☁️" : "💻", kind:provider, provider, providerId:name, writable:!!device.allowWrite, commandEnabled:!!device.allowCommands, tunnelName:name, vesselType:vessel, device };
}

export function previewDrive(preview = {}) {
  return { id:`preview-${preview.id}`, title:preview.title || preview.id, root:`/system/previews/${preview.id}`, url:`awtsmoos://preview/${preview.id}`, icon:"🔭", kind:"preview", provider:"preview", providerId:"preview", writable:false, preview };
}

export function receiptDrive() { return { id:"mission-receipts", title:"Mission Receipts", root:"/system/receipts", url:"awtsmoos://receipt/missions", icon:"🧾", kind:"receipt", provider:"receipt", writable:false }; }

/** B"H: machines enter through /network, and the UI need not know the distance. */
