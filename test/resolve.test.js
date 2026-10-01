import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DEFAULT_OFFICE_URL,
  focusSessionFrom,
  iframeSrc,
  officeUrl,
  wranglerSessionFor,
} from '../public/resolve.js';

const frameWindow = {};
const officeOrigin = 'http://127.0.0.1:3100';
const focus = (sessionId) => ({ source: 'pixel-agents', type: 'focusAgent', sessionId });

test('officeUrl falls back to the default when unset, blank, invalid or non-http', () => {
  for (const v of [undefined, '', '   ', 'not a url', 'javascript:alert(1)', 'file:///etc']) {
    assert.equal(officeUrl(v).toString(), new URL(DEFAULT_OFFICE_URL).toString(), String(v));
  }
  assert.equal(officeUrl(' http://localhost:4000 ').origin, 'http://localhost:4000');
});

test('iframeSrc points at the office root and names the embedder origin', () => {
  const src = new URL(iframeSrc(new URL('http://127.0.0.1:3100/some/path?token=x'), 'http://127.0.0.1:7878'));
  assert.equal(src.origin + src.pathname, 'http://127.0.0.1:3100/');
  assert.equal(src.searchParams.get('embedOrigin'), 'http://127.0.0.1:7878');
  assert.equal(src.searchParams.get('token'), null, 'never forwards a token');
});

test('focusSessionFrom accepts only a focus message from our frame on the office origin', () => {
  const ok = { origin: officeOrigin, source: frameWindow, data: focus('abc') };
  assert.equal(focusSessionFrom(ok, { officeOrigin, frameWindow }), 'abc');

  const bad = [
    { ...ok, origin: 'http://evil.example' },
    { ...ok, source: {} },
    { ...ok, data: { ...focus('abc'), source: 'other' } },
    { ...ok, data: { ...focus('abc'), type: 'closeAgent' } },
    { ...ok, data: focus('') },
    { ...ok, data: focus(42) },
    { ...ok, data: 'focusAgent' },
    null,
  ];
  for (const e of bad) assert.equal(focusSessionFrom(e, { officeOrigin, frameWindow }), null, JSON.stringify(e?.data));
});

test('wranglerSessionFor matches the card id or its live id after a fork or /clear', () => {
  const sessions = [
    { sessionId: 'card-1', liveSessionId: null },
    { sessionId: 'card-2', liveSessionId: 'live-2b' },
  ];
  assert.equal(wranglerSessionFor('card-1', sessions), 'card-1');
  assert.equal(wranglerSessionFor('live-2b', sessions), 'card-2');
  assert.equal(wranglerSessionFor('external', sessions), null);
  assert.equal(wranglerSessionFor('', sessions), null);
  assert.equal(wranglerSessionFor('card-1', undefined), null);
});
