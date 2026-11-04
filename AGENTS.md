# Alt Clicky

Firefox/Chrome Manifest V3 browser extension (Chrome no longer loads V2). The `codeblocks.js` content script provides per-site tweaks and an Alt-click element remover with Alt-Shift-click undo. Build Firefox's XPI with `npm run build`, which stages the repo in `firefox-dist/` and adds a new tab page (the van dashboard in an iframe) to that copy's manifest only, so Chrome keeps its own new tab; build and open it in Firefox Developer Edition with `npm run install:ff`. In Chrome, load the repo folder with Load unpacked at `chrome://extensions`. `background` lists both `service_worker` (Chrome) and `scripts` (Firefox); each browser ignores the other's key.

## Where things live
- `manifest.json`: extension metadata, permissions, and content/background script wiring.
- `codeblocks.js`: DOM-ready initialization, per-site behavior, Alt-click mode, and filtering UI.
- `jquery.min.js`: bundled jQuery loaded before the main content script.
- `clipboard.css`: content-script styles, including the pointer highlight.
- `background.js`, `tabStuff.js`, `jqGetSelector.js`: background entry point and browser/selector code.
- `newtab.html`: Firefox-only new tab page framing `http://vanpi:8788/`; an extension new tab leaves the address bar empty and focused, which a redirect does not.
- `scripts/build-firefox.js`: Firefox XPI build (staging, manifest override, `web-ext build`).
- `img/`: image assets; `update_ff_src.sh`: legacy Firefox source-update script.
- `package.json`, `package-lock.json`: npm dependencies and test/build/install commands.
- `test/load-content-script.js`: fresh jsdom setup, real script loading, and native event dispatch.
- `test/alt-click.test.js`: Alt-click DOM-event regression cases.
- `test/firefox-build.test.js`: Firefox build manifest and new tab page.
- `test/filter-autoscroll.test.js`: filter panel auto-scroll, filtering of newly loaded items, and live counts.
- `test/reddit-nsfw.test.js`: Reddit NSFW auto-reveal against a stub `shreddit-blurred-container`.

## Contracts
| Caller | Path | Owner |
| --- | --- | --- |
| Browser manifest | `jquery.min.js`, `codeblocks.js`, `clipboard.css`, `background.js` | Extension runtime |
| `npm test` | `test/*.test.js` | Regression suite |
| Firefox build manifest | `newtab.html` | `scripts/build-firefox.js` |
| `npm run install:ff` | `web-ext-artifacts/alt-clicky.xpi` | `npm run build` |

Test: `npm test` (node:test + jsdom, loads the real content scripts).
