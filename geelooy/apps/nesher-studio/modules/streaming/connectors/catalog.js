/* B"H */
export const streamingConnectors = [
  { id: 'youtube', name: 'YouTube', mode: 'oauth-or-custom', ingest: ['hls', 'rtmps'] },
  { id: 'twitch', name: 'Twitch', mode: 'manual-stream-key-first', ingest: ['rtmp'] },
  { id: 'facebook', name: 'Facebook Live', mode: 'manual-or-graph-later', ingest: ['rtmps'] },
  { id: 'awtsmoos', name: 'Awtsmoos Live', mode: 'hosted-optional', ingest: ['awts-hls', 'webtransport'] }
];
