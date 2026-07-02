// B"H
import * as Client from '../../../../remote/tunnelControlClient.js';

export async function openTunnels({ controller, system }) {
  system?.makeToast?.('Loading tunnels…', 'info', 'explorer');
  return await controller.navigate('/network');
}

export async function openMounts({ controller }) { return await controller.navigate('/desktop.folder'); }

export async function connectTunnel({ os, system, controller }) {
  system?.makeToast?.('Connecting to tunnel…', 'info', 'explorer');
  await os?.refreshRemoteDrives?.();
  const got = await Client.myDevice().catch(error => ({ ok:false, error:error.message }));
  const tunnelName = got?.recommended?.tunnelName || got?.tunnelName;
  const path = tunnelName ? `/network/${tunnelName}` : '/network';
  system?.makeToast?.(tunnelName ? `Connected: ${tunnelName}` : 'Tunnel list loaded', 'success', 'explorer');
  return await controller?.navigate?.(path);
}

export async function disconnectTunnel({ system }) {
  system?.makeToast?.('Use Tunnel Control to stop native agents.', 'info', 'explorer');
}
/** B"H: Connect speaks immediately, then opens the provider path when alive. */
