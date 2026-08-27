// B"H
/**
 * @module MultipartParser
 * @description
 * Chapter 116: A small multipart parser for Node tests and mobile uploads. It
 * accepts the raw body exposed by the Awtsmoos server and extracts fields/files
 * without adding a new dependency.
 */

function headerValue(headers, name) {
  const lowered = String(name).toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) if (String(key).toLowerCase() === lowered) return value;
  return '';
}

function rawBuffer($i) {
  const raw = $i?.$_POST?.__raw_body__ || $i?.request?.body?.__raw_body__ || $i?.request?.rawBody || $i?.body?.__raw_body__ || '';
  if (Buffer.isBuffer(raw)) return raw;
  if (typeof raw === 'string') return Buffer.from(raw, 'binary');
  return Buffer.alloc(0);
}

function boundaryFrom($i) {
  const contentType = headerValue($i?.request?.headers, 'content-type') || headerValue($i?.headers, 'content-type') || '';
  const match = String(contentType).match(/boundary=([^;]+)/i);
  return match ? match[1].replace(/^"|"$/g, '') : '';
}

function parseDisposition(value) {
  const out = {};
  String(value || '').split(';').map(part => part.trim()).forEach(part => {
    const [key, raw] = part.split('=');
    if (raw !== undefined) out[key] = raw.replace(/^"|"$/g, '');
  });
  return out;
}

function parseMultipart($i) {
  const boundary = boundaryFrom($i);
  const body = rawBuffer($i);
  if (!boundary || !body.length) return { fields: {}, files: [] };
  const marker = `--${boundary}`;
  const parts = body.toString('binary').split(marker).slice(1, -1);
  const fields = {};
  const files = [];
  for (const part of parts) {
    const trimmed = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
    const splitAt = trimmed.indexOf('\r\n\r\n');
    if (splitAt === -1) continue;
    const headerLines = trimmed.slice(0, splitAt).split('\r\n');
    const payloadBinary = trimmed.slice(splitAt + 4);
    const headers = Object.fromEntries(headerLines.map(line => {
      const index = line.indexOf(':');
      return index === -1 ? ['', ''] : [line.slice(0, index).toLowerCase(), line.slice(index + 1).trim()];
    }).filter(([key]) => key));
    const disposition = parseDisposition(headers['content-disposition']);
    const buffer = Buffer.from(payloadBinary, 'binary');
    if (disposition.filename) files.push({ fieldName: disposition.name, originalName: disposition.filename, mime: headers['content-type'] || 'application/octet-stream', buffer });
    else if (disposition.name) fields[disposition.name] = buffer.toString('utf8');
  }
  return { fields, files };
}

module.exports = { parseMultipart, rawBuffer, boundaryFrom };
