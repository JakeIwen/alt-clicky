# Alt Clicky

Firefox/Chrome Manifest V2 browser extension. The `codeblocks.js` content script provides per-site tweaks and an Alt-click element remover with Alt-Shift-click undo. Build Firefox's XPI with `npm run build`; build and open it in Firefox Developer Edition with `npm run install:ff`.

## Where things live
- `manifest.json`: extension metadata, permissions, and content/background script wiring.
- `codeblocks.js`: DOM-ready initialization, per-site behavior, Alt-click mode, and filtering UI.
- `jquery.min.js`: bundled jQuery loaded before the main content script.
- `clipboard.css`: content-script styles, including the pointer highlight.
- `background.js`, `tabStuff.js`, `jqGetSelector.js`: background entry point and browser/selector code.
- `img/`: image assets; `update_ff_src.sh`: legacy Firefox source-update script.
- `package.json`, `package-lock.json`: npm dependencies and test/build/install commands.
- `test/load-content-script.js`: fresh jsdom setup, real script loading, and native event dispatch.
- `test/alt-click.test.js`: Alt-click DOM-event regression cases.

## Contracts
| Caller | Path | Owner |
| --- | --- | --- |
| Browser manifest | `jquery.min.js`, `codeblocks.js`, `clipboard.css`, `background.js` | Extension runtime |
| `npm test` | `test/*.test.js` | Regression suite |
| `npm run install:ff` | `web-ext-artifacts/alt-clicky.xpi` | `npm run build` |

Test: `npm test` (node:test + jsdom, loads the real content scripts).
