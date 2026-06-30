// B"H
export async function openTunnels({ controller }) { return await controller.navigate('awtsmoos://tunnels'); }
export async function openMounts({ controller }) { return await controller.navigate('/'); }
export async function connectTunnel({ os, system }) { await os?.refreshRemoteDrives?.(); system?.makeToast?.('Tunnel list refreshed. Use Tunnel Control to connect new native agents.', 'info', 'explorer'); }
export async function disconnectTunnel({ system }) { system?.makeToast?.('Disconnect must be done from Tunnel Control for safety.', 'info', 'explorer'); }
/** B"H: tunnel buttons are honest: browse, refresh, or explain. */
