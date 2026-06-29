// B"H
import { action } from './action.js';

/** B"H: fake SSH is a mask, yet the permission covenant must still shine. */
export const FAKE_SSH_ACTIONS = Object.freeze([
  action('fakeSshAuth', 'Fake SSH auth', 'Create a verifier-backed fake SSH session.', 'Fake SSH', ['ssh','auth'], { username:'', password:'' }),
  action('fakeSshExec', 'Fake SSH exec', 'Run virtual shell commands over Geelooy mounts.', 'Fake SSH', ['ssh'], { sessionId:'', command:'pwd' }),
  action('fakeSshSftpList', 'Fake SFTP list', 'List virtual SFTP entries.', 'Fake SSH', ['sftp'], { sessionId:'', path:'/tunnels/local' }),
  action('fakeSshSftpRead', 'Fake SFTP read', 'Read a file through fake SFTP.', 'Fake SSH', ['sftp','read'], { sessionId:'', path:'/tunnels/local/README.md' }),
  action('fakeSshSftpWrite', 'Fake SFTP write', 'Write through fake SFTP when tunnel write is allowed.', 'Fake SSH', ['sftp','write'], { sessionId:'', path:'/tunnels/local/tmp.txt', needsContent:true }),
  action('fakeSshSftpMkdir', 'Fake SFTP mkdir', 'Create directory through guarded fake SFTP.', 'Fake SSH', ['sftp','write'], { sessionId:'', path:'/tunnels/local/tmp' }),
  action('fakeSshSftpRemove', 'Fake SFTP remove', 'Remove file/directory through guarded fake SFTP.', 'Fake SSH', ['sftp','danger-safe'], { sessionId:'', path:'/tunnels/local/tmp.txt' }),
  action('fakeSshServerStatus', 'Fake SSH server status', 'Show virtual shell/SFTP adapter readiness.', 'Fake SSH', ['ssh','status'], {})
]);
