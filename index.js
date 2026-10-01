import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Browser-only extension: the office is served by a separately running Pixel
// Agents server (`npx pixel-agents`) and embedded in an iframe by the view in
// public/client.js. No server capabilities are needed — opening a session is the
// client api's `openSession`, which is ungated.
export default {
  id: 'pixel-office',
  label: 'Pixel Office',
  description: 'Shows the Pixel Agents office as a board view. Click a character to open its session.',
  author: 'Victoria Xiao',
  requires: [],
  defaultEnabled: true,
  dir: path.dirname(fileURLToPath(import.meta.url)),
  client: 'public/client.js',
  styles: 'public/styles.css',
  settings: [
    {
      key: 'url',
      type: 'text',
      label: 'Pixel Agents URL',
      help: 'Where the Pixel Agents server is running. Leave the ?token= off — the office only needs read access. Defaults to http://127.0.0.1:3100.',
      placeholder: 'http://127.0.0.1:3100',
      maxLength: 200,
      pattern: '^https?://[^\\s?#]+$',
    },
  ],
};
