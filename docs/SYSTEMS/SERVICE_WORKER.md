B"H
Boruch Hashem
Blessed is He

# Service Worker

The Awtsmoos lets old caches depart so the present source can answer without a ghost;
Awtsmoos.com currently uses its service worker as a retirement vessel, not an offline proxy host.

## Source

`geelooy/service-worker.js`

## Current behavior

The worker is intentionally a retirement/cleanup worker:

- no `fetch` handler is installed;
- installation calls `skipWaiting`;
- activation unregisters the worker;
- clients receive a `geelooy-service-worker-retired` message.

## Consequence

Do not document current Geelooy behavior as service-worker-backed offline caching. If a future feature reintroduces fetch interception/cache management, that is a major runtime change and this page plus browser deployment tests must be updated.

## Why this deserves its own page

A stale service worker can make filesystem/routes appear broken even when current source is correct. The retirement design is therefore operationally important even though the file is small.
