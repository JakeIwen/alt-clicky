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

async function openFilter(t, ...titles) {
  const scrolls = { count: 0 };
  const page = await loadContentScript(t, {
    beforeLoad(window) {
      // jsdom has no layout: count the page scrolls instead, and let the
      // filter's innerText read textContent.
      window.scrollTo = () => { scrolls.count++; };
      Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get() { return this.textContent; },
      });
      window.document.body.insertAdjacentHTML('beforeend', '<ul class="grid" id="results"></ul>');
      addItems(window.document, ...titles);
    },
  });
  const { window, document } = page;
  document.querySelector('.card').classList.add('mouseOn');
  document.dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'Meta', ctrlKey: true, altKey: true, metaKey: true, bubbles: true,
  }));
  const setQuery = (id, value) => {
    const input = document.querySelector(id);
    input.value = value;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
  };
  const shown = () => [...document.querySelectorAll('.card')]
    .filter(el => el.style.display !== 'none').map(el => el.textContent);
  return { ...page, scrolls, setQuery, shown };
}

test('Queries need no quotes, and terms may contain spaces', async t => {
  const { setQuery, shown, document } = await openFilter(t,
    'Samsung 4TB SSD', 'Samsung 4 TB HDD', 'WD 4TB', 'Samsung 2TB', 'Samsung 4tb, sold');
  setQuery('#searchInclude', '[[4tb, 4 tb], samsung]');
  setQuery('#searchExclude', 'sold, 2 tb');
  assert.deepEqual(shown(), ['Samsung 4TB SSD', 'Samsung 4 TB HDD']);
  assert.equal(document.querySelector('#searchIncludeList').textContent, '[["4tb","4 tb"],"samsung"]');
});

test('Query parsing tolerates optional brackets, quotes, and half-typed input', async t => {
  const { window } = await openFilter(t, 'item 1', 'item 2');
  const parse = text => JSON.parse(JSON.stringify(window.parseTermList(text)));
  assert.deepEqual(parse('[]'), []);
  assert.deepEqual(parse('[4tb, 4 tb]'), ['4tb', '4 tb']);
  assert.deepEqual(parse('[4tb, 4 tb], Samsung'), [['4tb', '4 tb'], 'samsung']);
  assert.deepEqual(parse('["4tb","4tb"],["samsung"]'), [['4tb', '4tb'], ['samsung']]);
  assert.deepEqual(parse('" 4tb", "a, b"'), [' 4tb', 'a, b']);
  assert.deepEqual(parse('[[4tb, 4 t'), [['4tb', '4 t']]);
});

test('Auto-scroll keeps loading, filters new items, updates counts, and stops on a second click', async t => {
  const { window, document, scrolls, setQuery } = await openFilter(t,
    '14TB WD Red', '14TB Seagate SOLD', '12TB Exos');
  setQuery('#searchExclude', '[sold]');
  assert.equal(document.querySelector('#remainingResults').textContent, '2');

  const button = document.querySelector('#autoScroll');
  button.click();
  assert.equal(button.textContent, 'Stop scrolling');
  assert.equal(scrolls.count, 1, 'scrolls to the bottom at once');

  addItems(document, '14TB Toshiba sold', '14TB Ultrastar');
  await wait(window, 1100);
  assert.equal(scrolls.count, 2);
  const hidden = [...document.querySelectorAll('.card')]
    .filter(el => el.style.display === 'none').map(el => el.textContent);
  assert.deepEqual(hidden, ['14TB Seagate SOLD', '14TB Toshiba sold']);
  assert.equal(document.querySelector('#totalResults').textContent, 'Filtered 2 of about 5');
  assert.equal(document.querySelector('#remainingResults').textContent, '3');

  button.click();
  assert.equal(button.textContent, 'Auto-scroll');
  await wait(window, 1100);
  assert.equal(scrolls.count, 2, 'no scrolling after the second click');
});
