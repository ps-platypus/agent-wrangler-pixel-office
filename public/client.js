import { focusSessionFrom, iframeSrc, officeUrl, wranglerSessionFor } from './resolve.js';

// Pixel-art building, drawn as markup for the view's rail button.
const ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">'
  + '<path d="M2 14V4h5V2h7v12h-3v-3H9v3zM4 6v2h2V6zm0 4v2h2v-2zm5-6v2h2V4zm0 4v2h2V8zm3-4v2h1V4zm0 4v2h1V8z"/></svg>';

// One state object per mounted view element.
const views = new WeakMap();

export default {
  register(slots) {
    slots.register('view', {
      id: 'office',
      label: 'Pixel Office',
      icon: ICON,

      mount(el, api) {
        const office = officeUrl(api.settings?.().url);
        const frame = document.createElement('iframe');
        frame.className = 'pixel-office-frame';
        frame.title = 'Pixel Agents office';
        frame.src = iframeSrc(office, window.location.origin);

        const hint = document.createElement('div');
        hint.className = 'pixel-office-hint';
        hint.hidden = true;

        const state = { sessions: [], frame, hint, hintTimer: null, onMessage: null };
        state.onMessage = (event) => {
          const claudeId = focusSessionFrom(event, { officeOrigin: office.origin, frameWindow: frame.contentWindow });
          if (!claudeId) return;
          const sid = wranglerSessionFor(claudeId, state.sessions);
          if (sid) {
            api.openSession(sid);
          } else {
            showHint(state, 'That agent isn’t a Wrangler session (started outside the board).');
          }
        };
        window.addEventListener('message', state.onMessage);

        el.classList.add('pixel-office');
        el.append(frame, hint);
        views.set(el, state);
      },

      update(el, _session, graph) {
        const state = views.get(el);
        if (state && Array.isArray(graph?.sessions)) state.sessions = graph.sessions;
      },

      unmount(el) {
        const state = views.get(el);
        if (!state) return;
        window.removeEventListener('message', state.onMessage);
        clearTimeout(state.hintTimer);
        views.delete(el);
      },
    });
  },
};

function showHint(state, text) {
  state.hint.textContent = text;
  state.hint.hidden = false;
  clearTimeout(state.hintTimer);
  state.hintTimer = setTimeout(() => { state.hint.hidden = true; }, 3000);
}
