const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { firefoxManifest } = require('../scripts/build-firefox.js');

const ROOT = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

test('Firefox build adds a new tab page that exists in the extension', () => {
  const built = firefoxManifest(manifest);
  const page = built.chrome_url_overrides.newtab;
  assert.ok(fs.existsSync(path.join(ROOT, page)), `${page} is in the repo`);
  assert.equal(built.name, manifest.name, 'other manifest keys carry over');
});

test('Firefox build CSP does not upgrade the http dashboard iframe', () => {
  const csp = firefoxManifest(manifest).content_security_policy.extension_pages;
  assert.doesNotMatch(csp, /upgrade-insecure-requests/);
  assert.match(csp, /script-src 'self'/);
});

test('Firefox build watches frame navigation from existing background scripts', () => {
  const built = firefoxManifest(manifest);
  assert.ok(built.permissions.includes('webNavigation'));
  assert.equal(built.background.service_worker, undefined, 'Chrome-only key dropped');
  const { scripts } = built.background;
  assert.ok(scripts.indexOf('dashboard-url.js') < scripts.indexOf('newtab-navigation.js'),
    'the shared URL is defined before the script that reads it');
  for (const script of scripts) assert.ok(fs.existsSync(path.join(ROOT, script)), script);
});

test('checked-in manifest leaves Chrome\'s new tab page alone', () => {
  assert.equal(manifest.chrome_url_overrides, undefined);
  assert.ok(!manifest.permissions.includes('webNavigation'));
});

test('new tab page frames the van dashboard', async () => {
  const dom = await JSDOM.fromFile(path.join(ROOT, 'newtab.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
  });
  await new Promise(resolve => dom.window.addEventListener('load', resolve));
  const { document } = dom.window;
  assert.equal(document.querySelector('iframe').src, 'http://vanpi:8788/');
  for (const script of document.querySelectorAll('script')) {
    assert.ok(script.src, 'inline scripts would be blocked by the CSP');
  }
  dom.window.close();
});
