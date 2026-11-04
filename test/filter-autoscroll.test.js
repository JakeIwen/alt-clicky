const assert = require('node:assert/strict');
const test = require('node:test');
const { loadContentScript } = require('./load-content-script');

const wait = (window, ms) => new Promise(resolve => window.setTimeout(resolve, ms));

function addItems(document, ...titles) {
  const list = document.querySelector('#results');
  for (const title of titles) {
    const li = document.createElement('li');
    li.className = 'card';
    li.textContent = title;
    list.append(li);
  }
}

test('Auto-scroll keeps loading, filters new items, updates counts, and stops on a second click', async t => {
  let scrolls = 0;
  const { window, document } = await loadContentScript(t, {
    beforeLoad(window) {
      // jsdom has no layout: count the page scrolls instead, and let the
      // filter's innerText read textContent.
      window.scrollTo = () => { scrolls++; };
      Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get() { return this.textContent; },
      });
      window.document.body.insertAdjacentHTML('beforeend', '<ul class="grid" id="results"></ul>');
      addItems(window.document, '14TB WD Red', '14TB Seagate SOLD', '12TB Exos');
    },
  });
  document.querySelector('.card').classList.add('mouseOn');
  document.dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'Meta', ctrlKey: true, altKey: true, metaKey: true, bubbles: true,
  }));
  const exclude = document.querySelector('#searchExclude');
  exclude.value = '[sold]';
  exclude.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(document.querySelector('#remainingResults').textContent, '2');

  const button = document.querySelector('#autoScroll');
  button.click();
  assert.equal(button.textContent, 'Stop scrolling');
  assert.equal(scrolls, 1, 'scrolls to the bottom at once');

  addItems(document, '14TB Toshiba sold', '14TB Ultrastar');
  await wait(window, 1100);
  assert.equal(scrolls, 2);
  const hidden = [...document.querySelectorAll('.card')]
    .filter(el => el.style.display === 'none').map(el => el.textContent);
  assert.deepEqual(hidden, ['14TB Seagate SOLD', '14TB Toshiba sold']);
  assert.equal(document.querySelector('#totalResults').textContent, 'Filtered 2 of about 5');
  assert.equal(document.querySelector('#remainingResults').textContent, '3');

  button.click();
  assert.equal(button.textContent, 'Auto-scroll');
  await wait(window, 1100);
  assert.equal(scrolls, 2, 'no scrolling after the second click');
});
