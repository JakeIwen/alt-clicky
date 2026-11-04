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

test('checked-in manifest leaves Chrome\'s new tab page alone', () => {
  assert.equal(manifest.chrome_url_overrides, undefined);
});

test('new tab page frames the van dashboard', () => {
  const html = fs.readFileSync(path.join(ROOT, 'newtab.html'), 'utf8');
  const { document } = new JSDOM(html).window;
  assert.equal(document.querySelector('iframe').getAttribute('src'), 'http://vanpi:8788/');
  assert.equal(document.querySelectorAll('script').length, 0, 'no scripts for the CSP to block');
});
