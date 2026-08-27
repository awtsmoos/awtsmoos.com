// B"H
// Binah-Constants.js: Understanding - Protocol Definitions

'use strict';

const CIPHER_STREAM = 1 << 0;

function cipherInfo(sslName, blockLen, keyLen, ivLen, authLen, discardLen, flags) {
  return {
    sslName,
    blockLen,
    keyLen,
    ivLen: (ivLen !== 0 || (flags & CIPHER_STREAM) ? ivLen : blockLen),
    authLen, // For AEAD ciphers like GCM and ChaCha20-Poly1305
    discardLen,
    stream: !!(flags & CIPHER_STREAM),
  };
}

function macInfo(sslName, len, actualLen, isETM) {
  return { sslName, len, actualLen, isETM };
}

module.exports = {
  // SSH Message Numbers
  MESSAGE: {
    DISCONNECT: 1,
    IGNORE: 2,
    UNIMPLEMENTED: 3,
    DEBUG: 4,
    SERVICE_REQUEST: 5,
    SERVICE_ACCEPT: 6,
    KEXINIT: 20,
    NEWKEYS: 21,
    KEXDH_INIT: 30,
    KEXDH_REPLY: 31,
    USERAUTH_REQUEST: 50,
    USERAUTH_FAILURE: 51,
    USERAUTH_SUCCESS: 52,
    USERAUTH_BANNER: 53,
    USERAUTH_INFO_REQUEST: 60,
    USERAUTH_INFO_RESPONSE: 61,
    GLOBAL_REQUEST: 80,
    REQUEST_SUCCESS: 81,
    REQUEST_FAILURE: 82,
    CHANNEL_OPEN: 90,
    CHANNEL_OPEN_CONFIRMATION: 91,
    CHANNEL_OPEN_FAILURE: 92,
    CHANNEL_WINDOW_ADJUST: 93,
    CHANNEL_DATA: 94,
    CHANNEL_EXTENDED_DATA: 95,
    CHANNEL_EOF: 96,
    CHANNEL_CLOSE: 97,
    CHANNEL_REQUEST: 98,
    CHANNEL_SUCCESS: 99,
    CHANNEL_FAILURE: 100
  },

  // Disconnection Reasons
  DISCONNECT_REASON: {
    HOST_NOT_ALLOWED_TO_CONNECT: 1,
    PROTOCOL_ERROR: 2,
    KEY_EXCHANGE_FAILED: 3,
    MAC_ERROR: 5,
    COMPRESSION_ERROR: 6,
    SERVICE_NOT_AVAILABLE: 7,
    PROTOCOL_VERSION_NOT_SUPPORTED: 8,
    HOST_KEY_NOT_VERIFIABLE: 9,
    CONNECTION_LOST: 10,
    BY_APPLICATION: 11,
    TOO_MANY_CONNECTIONS: 12,
    AUTH_CANCELED_BY_USER: 13,
    NO_MORE_AUTH_METHODS_AVAILABLE: 14,
    ILLEGAL_USER_NAME: 15,
  },
  
  // Channel Open Failure Reasons
  CHANNEL_OPEN_FAILURE: {
    ADMINISTRATIVELY_PROHIBITED: 1,
    CONNECT_FAILED: 2,
    UNKNOWN_CHANNEL_TYPE: 3,
    RESOURCE_SHORTAGE: 4
  },

  // Cryptographic Algorithm Information
  CIPHER_INFO: {
    //                                               keyLen, ivLen
    //                                                        |
    'chacha20-poly1305@openssh.com': cipherInfo('chacha20', 8, 64, 12, 16, 0, CIPHER_STREAM), // <-- FIX: ivLen MUST be 12 for chacha20
    'aes128-gcm@openssh.com':        cipherInfo('aes-128-gcm', 16, 16, 12, 16, 0, CIPHER_STREAM),
    'aes256-gcm@openssh.com':        cipherInfo('aes-256-gcm', 16, 32, 12, 16, 0, CIPHER_STREAM),
    'aes128-ctr':                    cipherInfo('aes-128-ctr', 16, 16, 16, 0, 0, CIPHER_STREAM),
    'aes192-ctr':                    cipherInfo('aes-192-ctr', 16, 24, 16, 0, 0, CIPHER_STREAM),
    'aes256-ctr':                    cipherInfo('aes-256-ctr', 16, 32, 16, 0, 0, CIPHER_STREAM),
    'aes128-cbc':                    cipherInfo('aes-128-cbc', 16, 16, 0, 0, 0, 0),
    'aes256-cbc':                    cipherInfo('aes-256-cbc', 16, 32, 0, 0, 0, 0),
    '3des-cbc':                      cipherInfo('des-ede3-cbc', 8, 24, 0, 0, 0, 0),
  },
  
  MAC_INFO: {
    'hmac-sha2-256-etm@openssh.com': macInfo('sha256', 32, 32, true),
    'hmac-sha2-512-etm@openssh.com': macInfo('sha512', 64, 64, true),
    'hmac-sha1-etm@openssh.com':     macInfo('sha1', 20, 20, true),
    'hmac-sha2-256':                 macInfo('sha256', 32, 32, false),
    'hmac-sha2-512':                 macInfo('sha512', 64, 64, false),
    'hmac-sha1':                     macInfo('sha1', 20, 20, false),
  },

  // Default Algorithm Lists for KEXINIT
  DEFAULT_KEX: [
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
    'ecdh-sha2-nistp384',
    'ecdh-sha2-nistp521',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group16-sha512',
  ],

  DEFAULT_SERVER_HOST_KEY: [
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'rsa-sha2-512',
    'rsa-sha2-256',
    'ssh-rsa',
  ],

  DEFAULT_CIPHER: [
    'aes128-ctr',
    'aes256-ctr',
    'chacha20-poly1305@openssh.com',
  ],

  DEFAULT_MAC: [
    'hmac-sha2-256',
    'hmac-sha2-512',
    'hmac-sha2-256-etm@openssh.com',
    'hmac-sha2-512-etm@openssh.com',
    'hmac-sha1-etm@openssh.com',
    'hmac-sha1',
  ],

  DEFAULT_COMPRESSION: [
    'none',
    'zlib@openssh.com',
    'zlib',
  ],
};
