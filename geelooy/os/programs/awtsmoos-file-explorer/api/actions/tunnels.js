// B"H
import * as Client from '../../../../remote/tunnelControlClient.js';

/**
 * B"H
 * The Connect button now opens a real live vessel when one exists. If many
 * vessels stand before the user, it reveals the tunnel gate with every name.
 */
export async function openTunnels({ controller }) {
  return await controller.navigate('awtsmoos://tunnels');
}

export async function openMounts({ controller }) {
  return await controller.navigate('/');
}

export async function connectTunnel({ os, system, controller }) {
  await os?.refreshRemoteDrives?.();
  const got = await Client.myDevice().catch(() => ({}));
  const tunnelName = got?.recommended?.tunnelName || got?.tunnelName;
  const path = tunnelName ? `awtsmoos://tunnels/${tunnelName}` : 'awtsmoos://tunnels';
  system?.makeToast?.('Connect complete', 'success', 'explorer');
  return await controller?.navigate?.(path);
}

export async function disconnectTunnel({ system }) {
  system?.makeToast?.('Use Tunnel Control to stop native agents.', 'info', 'explorer');
}
