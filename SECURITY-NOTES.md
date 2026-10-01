## Accepted risks

- None recorded.

## Findings and resolutions

- 2026-10-01: Pre-publication review of the full tree (index.js, public/*, test/*, package.json). No secrets, tokens, internal hostnames or credentials found. -> No action needed.
- 2026-10-01: No `.gitignore`, so a later `npm install` could commit `node_modules/` or a local `.env`. -> Add a `.gitignore` before the first commit.
- 2026-10-01: The iframe has no `sandbox` attribute. It only loads the user-configured Pixel Agents URL, so risk is low. -> Optional hardening: `sandbox="allow-scripts allow-same-origin"`; test that the office still works.

## Living threat model

Browser-only Agent Wrangler extension. It embeds a Pixel Agents server (default http://127.0.0.1:3100) in an iframe and listens for `focusAgent` postMessages. Messages are accepted only when both `event.origin` and `event.source` match our frame, and the session id is looked up against Wrangler's own sessions before `openSession` is called. The settings URL is restricted to http(s), and the extension never forwards a `?token=`. The main thing that matters if this goes wrong: a malicious page at the configured office URL could make the board open one of the user's own sessions, which is low impact.
