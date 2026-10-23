const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

async function loadContentScript(t) {
  const sources = await Promise.all(['jquery.min.js', 'codeblocks.js'].map(file =>
    readFile(path.join(__dirname, '..', file), 'utf8')));
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <main id="fixture">
      <p id="before">Before</p>
      <div id="a">Element A</div>
      <div id="b">Element B</div>
      <a id="link" href="#destination">Link</a>
      <button id="undo">Undo target</button>
    </main>
  </body></html>`, {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });
  t.after(() => {
    dom.window.close();
    assert.deepEqual(errors, [], 'content scripts must not raise jsdom errors');
  });

  const { window } = dom;
  // Evaluate both scripts before yielding, as with document_start injection.
  for (const source of sources) window.eval(source);
  // Register after the script's ready callback, then allow ready errors to surface.
  await new Promise(resolve => window.jQuery(resolve));
  await new Promise(resolve => window.setTimeout(resolve, 0));
  assert.ok(window.document.querySelector('#fSearch'), 'DOM-ready initialization ran');

  const { document } = window;
  return {
    window,
    document,
    fixture: document.querySelector('#fixture'),
    a: document.querySelector('#a'),
    b: document.querySelector('#b'),
    link: document.querySelector('#link'),
    undo: document.querySelector('#undo'),
    key(type = 'keydown', options = {}) {
      const event = new window.KeyboardEvent(type, {
        key: 'Alt',
        altKey: type === 'keydown',
        bubbles: true,
        cancelable: true,
        ...options,
      });
      document.dispatchEvent(event);
      return event;
    },
    mouse(target, type = 'mousemove', options = {}) {
      const event = new window.MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        altKey: true,
        ...options,
      });
      target.dispatchEvent(event);
      return event;
    },
  };
}

module.exports = { loadContentScript };
