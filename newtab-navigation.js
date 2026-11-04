// Firefox background script. The new tab page frames the dashboard so the
// address bar starts empty (see newtab.html); once the user navigates inside
// the frame (a pane link such as #backups), the tab moves to that real URL so
// the address bar shows where they are and the link can be copied.
const NEW_TAB_URL = browser.runtime.getURL('newtab.html');

function leavesDashboardRoot(url) {
  // Closing a pane can leave a bare "#" behind; that is still the root.
  return url.replace(/#$/, '') !== DASHBOARD_URL;
}

async function onFrameNavigation(details) {
  if (details.frameId === 0) return;
  const tab = await browser.tabs.get(details.tabId).catch(() => null);
  if (!tab || tab.url !== NEW_TAB_URL) return;
  if (!leavesDashboardRoot(details.url)) return;
  // loadReplace drops the blank new tab from history, so Back leaves the tab.
  await browser.tabs.update(details.tabId, { url: details.url, loadReplace: true });
}

// Full loads, pushState/replaceState, and hash changes inside the frame.
for (const event of ['onCommitted', 'onHistoryStateUpdated', 'onReferenceFragmentUpdated']) {
  browser.webNavigation[event].addListener(onFrameNavigation);
}
