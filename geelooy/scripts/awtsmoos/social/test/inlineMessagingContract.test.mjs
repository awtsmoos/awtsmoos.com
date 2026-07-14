// B"H
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const src=readFileSync('geelooy/scripts/awtsmoos/social/shared/inlineMessaging.js','utf8');
assert(src.includes('/api/social/mail/sendTo'));
assert(src.includes('URLSearchParams'));
assert(src.includes('aria-live'));
assert(!src.includes('toEmail='),'inline module does not invent external email send bodies');
const home=readFileSync('geelooy/scripts/awtsmoos/social/home/inline-actions/index.js','utf8');
assert(home.includes("action==='message'"));
