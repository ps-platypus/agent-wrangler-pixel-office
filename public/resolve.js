// Pure helpers for the Pixel Office view — no DOM, so `node --test` covers them.

export const DEFAULT_OFFICE_URL = 'http://127.0.0.1:3100';
export const OFFICE_MESSAGE_SOURCE = 'pixel-agents';

/** The configured office URL as a parsed URL, or the default when unset or invalid. */
export function officeUrl(setting) {
  const raw = typeof setting === 'string' && setting.trim() ? setting.trim() : DEFAULT_OFFICE_URL;
  try {
    const u = new URL(raw);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u;
  } catch { /* fall through */ }
  return new URL(DEFAULT_OFFICE_URL);
}

/** The iframe src: the office root, told which origin may receive its focus messages. */
export function iframeSrc(officeURL, embedderOrigin) {
  const u = new URL('/', officeURL);
  u.searchParams.set('embedOrigin', embedderOrigin);
  return u.toString();
}

/**
 * The Claude session id from a message event, or null if the event is not a
 * focus click from OUR office frame. Origin and source are both checked: origin
 * alone would accept any other frame on that origin.
 */
export function focusSessionFrom(event, { officeOrigin, frameWindow }) {
  if (!event || event.origin !== officeOrigin || event.source !== frameWindow) return null;
  const d = event.data;
  if (!d || typeof d !== 'object' || d.source !== OFFICE_MESSAGE_SOURCE || d.type !== 'focusAgent') return null;
  return typeof d.sessionId === 'string' && d.sessionId ? d.sessionId : null;
}

/**
 * Map a Claude session id to the Wrangler card that owns it. Wrangler launches
 * Claude with `--session-id <card id>`, but a fork or /clear moves the
 * conversation to a new live id, so both are checked. Null when the session was
 * not launched by this Wrangler (an external Claude terminal, say).
 */
export function wranglerSessionFor(claudeSessionId, sessions) {
  if (!claudeSessionId || !Array.isArray(sessions)) return null;
  const hit = sessions.find((s) => s && (s.sessionId === claudeSessionId || s.liveSessionId === claudeSessionId));
  return hit ? hit.sessionId : null;
}
