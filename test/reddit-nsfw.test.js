const assert = require('node:assert/strict');
const test = require('node:test');
const { loadContentScript } = require('./load-content-script');

// Mirrors logged-out Reddit's <shreddit-blurred-container>: an open shadow root
// whose overlay button unblurs the post. `render()` stands in for Lit filling
// the shadow root after the element is already in the page.
function defineBlurredContainer(window) {
  window.customElements.define('shreddit-blurred-container', class extends window.HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    render() {
      const button = this.ownerDocument.createElement('button');
      button.textContent = 'View NSFW content';
      button.addEventListener('click', () => this.removeAttribute('blurred'));
      this.shadowRoot.append(button);
    }
  });
}

function addContainer(document, reason, { render = true } = {}) {
  const el = document.createElement('shreddit-blurred-container');
  el.setAttribute('reason', reason);
  el.setAttribute('blurred', '');
  document.body.append(el);
  if (render) el.render();
  return el;
}

const tick = window => new Promise(resolve => window.setTimeout(resolve, 300));

test('Reddit NSFW blurs are revealed at load, on scroll-in, and after late render', async t => {
  let initial, spoiler;
  const { window, document } = await loadContentScript(t, {
    url: 'https://www.reddit.com/r/nsfw/',
    beforeLoad(window) {
      defineBlurredContainer(window);
      initial = addContainer(window.document, 'nsfw');
      spoiler = addContainer(window.document, 'spoiler');
    },
  });
  assert.equal(initial.hasAttribute('blurred'), false);

  const scrolledIn = addContainer(document, 'nsfw');
  const lateRender = addContainer(document, 'nsfw', { render: false });
  await tick(window);
  assert.equal(scrolledIn.hasAttribute('blurred'), false);
  assert.equal(lateRender.hasAttribute('blurred'), true, 'no button rendered yet');

  lateRender.render();
  await tick(window);
  assert.equal(lateRender.hasAttribute('blurred'), false);
  assert.equal(spoiler.hasAttribute('blurred'), true, 'spoiler blurs are left alone');
});

test('Other sites leave blurred containers alone', async t => {
  let el;
  const { window } = await loadContentScript(t, {
    beforeLoad(window) {
      defineBlurredContainer(window);
      el = addContainer(window.document, 'nsfw');
    },
  });
  await tick(window);
  assert.equal(el.hasAttribute('blurred'), true);
});
