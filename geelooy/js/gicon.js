// B"H
// Shared golden icon registry for the gicon system (Yaakov 2026-10-13, icon round 2).
// Central map of versioned Drive URLs for every gicon image asset.
// Pages that render icons from JS should import this instead of hardcoding URLs.
//
// Usage:
//   import { giconUrl, giconImg } from '/js/gicon.js';
//   img.src = giconUrl('inbox');
//   button.append(giconImg(document, 'send', 'gicon--sm'));

const ICON_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons';

export const GICON_URLS = Object.freeze({
  archive: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-archive.webp?v=907ca7f142',
  attach: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-attach.webp?v=ddf2129090',
  book: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-book.webp?v=89fce054b2',
  camera: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-camera.webp?v=842c9ce328',
  check: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-check.webp?v=a807cadc4f',
  code: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-code.webp?v=37862d15f1',
  coin: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-coin.webp?v=9c06fe03b9',
  comment: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-comment.webp?v=c5d6b22649',
  compass: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-compass.webp?v=0b6a772624',
  edit: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-edit.webp?v=4a58469fca',
  file-audio: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file-audio.webp?v=d7b71f52d3',
  file-image: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file-image.webp?v=708a41a543',
  file-pdf: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file-pdf.webp?v=c1eb0f6ebe',
  file-text: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file-text.webp?v=14f932f618',
  file-video: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file-video.webp?v=c60dc1ef95',
  file-zip: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file-zip.webp?v=adb96e8f4e',
  file: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-file.webp?v=a4ac35335f',
  filter: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-filter.webp?v=b2aa078c97',
  folder: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-folder.webp?v=9bbd4c839f',
  globe: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-globe.webp?v=f91b074012',
  inbox: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-inbox.webp?v=9b8c10d046',
  info: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-info.webp?v=cbdd4bfb28',
  layers: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-layers.webp?v=0aeef9a4c9',
  message: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-message.webp?v=7a05802393',
  more: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-more.webp?v=f27158ab76',
  newfolder: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-newfolder.webp?v=c1d4557b60',
  refresh: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-refresh.webp?v=a462dbedff',
  reply: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-reply.webp?v=32e1292a2e',
  send: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-send.webp?v=6db11f2754',
  trash: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-trash.webp?v=d2f1664093',
  up: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-up.webp?v=ea93ec9bf1',
  upload: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-upload.webp?v=82f13f6a18',
  users: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-users.webp?v=a99ebb2312',
});

// Pre-existing media-generation icons, kept for compatibility.
export const GICON_LEGACY_URLS = Object.freeze({
  'home': ICON_BASE + '/media-generation-icon-home-active-0-b96032c0-3cbf-446e-9d85-7535113dcb9e.webp',
  'mail': ICON_BASE + '/media-generation-icon-mail-regular-0-e8ff743a-c987-452f-b549-64e23af957fc.webp',
  'mail-hover': ICON_BASE + '/media-generation-icon-mail-hover-0-80a1e120-b5f0-4048-8993-da249ad8f2ba.webp',
  'mail-active': ICON_BASE + '/media-generation-icon-mail-active-0-5eeb377a-c992-4008-b428-0ba9a5cff318.webp',
  'mail-focus': ICON_BASE + '/media-generation-icon-mail-focus-0-c2c7f45e-a0fa-479b-8c54-b24c7659d3fd.webp',
  'profile': ICON_BASE + '/media-generation-icon-profile-active-0-e824a593-e9df-4597-83b4-38adf2b99e33.webp',
  'search': ICON_BASE + '/media-generation-icon-search-0-2d839271-ea0a-46bb-a647-16fc27971baa.webp',
  'plus': ICON_BASE + '/media-generation-icon-plus-0-d374e76f-81c4-4652-9761-2566142effc7.webp',
  'torah': ICON_BASE + '/media-generation-icon-torah-active-0-7cccc6e3-c14e-4edd-a9e4-e0dc2c164897.webp',
  'play': ICON_BASE + '/media-generation-icon-play-0-0ef448c3-ed56-4073-97d6-7462d0c7365f.webp',
  'heart': ICON_BASE + '/media-generation-icon-heart-0-5629aacd-4b69-455b-b1b1-f86479475807.webp',
  'share': ICON_BASE + '/media-generation-icon-share-0-5961f07f-21a6-4ff0-abb1-31888cabdd28.webp',
  'bookmark': ICON_BASE + '/media-generation-icon-bookmark-0-03bd3c64-fec6-49ab-a919-902a42f29850.webp',
  'star': ICON_BASE + '/media-generation-icon-star-0-ed1fd3f7-b107-42e7-9281-e9556ece1a94.webp',
  'settings': ICON_BASE + '/media-generation-icon-settings-0-58aad987-88b3-4631-ad89-80f9a2f61148.webp',
  'back': ICON_BASE + '/media-generation-icon-back-0-1af40db7-998c-4306-992c-7e6a5cd8b27c.webp',
  'close': ICON_BASE + '/media-generation-icon-close-0-79a598be-635a-4ed6-a326-9c4523429714.webp',
  'download': ICON_BASE + '/media-generation-icon-download-0-6044ac23-de44-4924-bc82-b6b7b80dc181.webp',
  'games': ICON_BASE + '/media-generation-icon-games-active-0-0b3b0c3a-0a12-44bc-bb4c-49690a5e60f5.webp',
  'bell': ICON_BASE + '/media-generation-icon-bell-0-f1a1d60a-6489-42a0-b287-7ad32717e62a.webp',
});

/** Versioned URL for a round-2 gicon by name (e.g. 'inbox'), or '' when unknown. */
export function giconUrl(name) {
  return GICON_URLS[name] || '';
}

/**
 * Builds an <img class="gicon gicon--<name> ..."> element with accessible defaults.
 * @param {Document} root Document that owns the element.
 * @param {string} name Icon name (must exist in GICON_URLS or GICON_LEGACY_URLS).
 * @param {string} sizeClass Optional extra class like 'gicon--sm'.
 * @param {string} alt Alt text; '' (decorative) by default — owning control carries the label.
 */
export function giconImg(root, name, sizeClass = '', alt = '') {
  const img = root.createElement('img');
  img.className = ['gicon', 'gicon--' + name, sizeClass].filter(Boolean).join(' ');
  img.src = GICON_URLS[name] || GICON_LEGACY_URLS[name] || '';
  img.alt = alt;
  img.setAttribute('aria-hidden', String(alt === ''));
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = 48;
  img.height = 48;
  return img;
}
