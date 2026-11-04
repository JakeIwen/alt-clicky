const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const NEW_TAB_URL = 'moz-extension://uuid/newtab.html';

// Runs the Firefox background scripts against a stub browser API and returns
// the registered listener plus the tabs.update calls it makes.
function loadBackground({ tabUrl = NEW_TAB_URL } = {}) {
  const updates = [];
  const listeners = new Set();
  const event = { addListener: fn => listeners.add(fn) };
  const browser = {
    runtime: { getURL: file => `moz-extension://uuid/${file}` },
    tabs: {
      get: async id => (id === 1 ? { url: tabUrl } : Promise.reject(new Error('gone'))),
      update: async (id, props) => updates.push({ id, ...props }),
    },
    webNavigation: {
      onCommitted: event, onHistoryStateUpdated: event, onReferenceFragmentUpdated: event,
    },
  };
  const context = vm.createContext({ browser });
  for (const file of ['dashboard-url.js', 'newtab-navigation.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
  }
  assert.equal(listeners.size, 1, 'one handler covers every navigation event');
  const [navigate] = listeners;
  return { navigate, updates };
}

test('a pane link inside the frame moves the tab to that URL', async () => {
  const { navigate, updates } = loadBackground();
  await navigate({ tabId: 1, frameId: 7, url: 'http://vanpi:8788/#backups' });
  assert.deepEqual(updates, [{ id: 1, url: 'http://vanpi:8788/#backups', loadReplace: true }]);
});

test('the frame loading the dashboard root is not a navigation away', async () => {
  const { navigate, updates } = loadBackground();
  // The frame commits about:blank before its src is set; the tab must stay.
  await navigate({ tabId: 1, frameId: 7, url: 'about:blank' });
  await navigate({ tabId: 1, frameId: 7, url: 'http://vanpi:8788/' });
  await navigate({ tabId: 1, frameId: 7, url: 'http://vanpi:8788/#' });
  assert.deepEqual(updates, []);
});

test('top-level navigation and other tabs are left alone', async () => {
  const { navigate, updates } = loadBackground({ tabUrl: 'http://vanpi:8788/' });
  await navigate({ tabId: 1, frameId: 0, url: 'http://example.com/' });
  await navigate({ tabId: 1, frameId: 7, url: 'http://vanpi:8788/#backups' });
  await navigate({ tabId: 2, frameId: 7, url: 'http://vanpi:8788/#backups' });
  assert.deepEqual(updates, []);
});
