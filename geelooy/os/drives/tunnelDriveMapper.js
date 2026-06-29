// B"H
export function deviceDrive(device = {}) {
  const kind = device.vesselType || device.kind || (device.syntheticTunnel ? 'virtual-os' : 'native');
  return { id:`tunnel-${device.tunnelName}`, title:device.deviceName || device.tunnelName || 'Tunnel', root:`awtsmoos://tunnels/${device.tunnelName}`, icon:kind === 'virtual-os' ? '☁️' : kind === 'browser-tab' ? '🌐' : '💻', kind:'remote', writable:!!device.allowWrite, commandEnabled:!!device.allowCommands, tunnelName:device.tunnelName, vesselType:kind, device };
}
export function previewDrive(preview = {}) { return { id:`preview-${preview.id}`, title:preview.title || preview.id, root:`awtsmoos://previews/${preview.id}`, icon:'🔭', kind:'preview', writable:false, preview }; }
export function receiptDrive() { return { id:'mission-receipts', title:'Mission Receipts', root:'awtsmoos://receipts', icon:'🧾', kind:'remote', writable:false }; }
