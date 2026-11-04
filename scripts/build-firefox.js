// Builds the Firefox XPI from a staged copy whose manifest adds the new tab
// page. Chrome loads the repo folder unpacked, so the checked-in manifest
// stays free of the override and Chrome keeps its own new tab page.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const STAGE = path.join(ROOT, 'firefox-dist');
const ARTIFACTS = path.join(ROOT, 'web-ext-artifacts');
const EXCLUDED = new Set([
  '.git', 'node_modules', 'firefox-dist', 'web-ext-artifacts', 'scripts', 'test', 'img',
  'package.json', 'package-lock.json', 'README.md', 'AGENTS.md', 'update_ff_src.sh',
]);

function firefoxManifest(manifest) {
  // Firefox ignores Chrome's service_worker key; leaving it out keeps the
  // Firefox manifest lint-clean.
  const { service_worker, ...background } = manifest.background;
  return {
    ...manifest,
    // webNavigation lets newtab-navigation.js see navigations inside the
    // dashboard frame.
    permissions: [...manifest.permissions, 'webNavigation'],
    background: {
      ...background,
      scripts: ['dashboard-url.js', 'newtab-navigation.js', ...background.scripts],
    },
    chrome_url_overrides: { newtab: 'newtab.html' },
    // Firefox's MV3 default adds upgrade-insecure-requests, which would turn
    // the dashboard's http:// iframe into a failing https:// load.
    content_security_policy: { extension_pages: "script-src 'self'" },
  };
}

function build() {
  fs.rmSync(STAGE, { recursive: true, force: true });
  for (const entry of fs.readdirSync(ROOT)) {
    if (EXCLUDED.has(entry) || entry.startsWith('.')) continue;
    fs.cpSync(path.join(ROOT, entry), path.join(STAGE, entry), { recursive: true });
  }
  const manifestPath = path.join(STAGE, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  fs.writeFileSync(manifestPath, JSON.stringify(firefoxManifest(manifest), null, 2));
  execFileSync('web-ext', [
    'build', '--overwrite-dest', '--filename', 'alt-clicky.xpi',
    '--source-dir', STAGE, '--artifacts-dir', ARTIFACTS,
  ], { stdio: 'inherit' });
}

module.exports = { firefoxManifest };

if (require.main === module) build();
