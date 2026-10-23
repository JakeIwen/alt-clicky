const assert = require('node:assert/strict');
const test = require('node:test');
const { loadContentScript } = require('./load-content-script');

test('1. Alt mode moves the highlight from A to B', async t => {
  const { document, a, b, key, mouse } = await loadContentScript(t);
  key();
  mouse(a);
  assert.ok(a.classList.contains('mouseOn'));
  mouse(b);
  assert.ok(b.classList.contains('mouseOn'));
  assert.ok(!a.classList.contains('mouseOn'));
  assert.deepEqual([...document.querySelectorAll('.mouseOn')], [b]);
});

test('2. Any keyup clears the highlight and disables Alt mode', async t => {
  const { document, a, b, key, mouse } = await loadContentScript(t);
  key();
  mouse(a);
  assert.ok(a.classList.contains('mouseOn'));
  key('keyup', { key: 'x', altKey: true });
  assert.equal(document.querySelector('.mouseOn'), null);
  mouse(b);
  assert.equal(document.querySelector('.mouseOn'), null);
});

test('3. Mousemove without Alt recovers from a missing keyup and stays off', async t => {
  const { document, a, b, key, mouse } = await loadContentScript(t);
  key();
  mouse(a);
  assert.ok(a.classList.contains('mouseOn'));
  mouse(b, 'mousemove', { altKey: false });
  assert.equal(document.querySelector('.mouseOn'), null);
  mouse(a);
  assert.equal(document.querySelector('.mouseOn'), null);
});

test('4. Click without Alt neither detaches its target nor prevents default', async t => {
  const { document, fixture, a, b, key, mouse } = await loadContentScript(t);
  key();
  mouse(a);
  const click = mouse(a, 'click', { altKey: false });
  assert.equal(a.parentElement, fixture);
  assert.equal(document.querySelector('#a'), a);
  assert.equal(document.querySelector('[id^="acy-"]'), null);
  assert.equal(click.defaultPrevented, false);
  assert.equal(document.querySelector('.mouseOn'), null);
  mouse(b);
  assert.equal(document.querySelector('.mouseOn'), null);
});

test('5. Alt-click leaves a placeholder and Alt-Shift-click restores the original position', async t => {
  const { document, fixture, a, undo, key, mouse } = await loadContentScript(t);
  const originalOrder = [...fixture.children];
  const position = originalOrder.indexOf(a);
  key();
  mouse(a, 'click');
  assert.equal(a.isConnected, false);
  const placeholder = document.querySelector('#acy-0');
  assert.ok(placeholder);
  assert.equal(placeholder.tagName, 'I');
  const detachedOrder = [...originalOrder];
  detachedOrder[position] = placeholder;
  assert.deepEqual([...fixture.children], detachedOrder);
  mouse(undo, 'click', { shiftKey: true });
  assert.equal(document.querySelector('#a'), a);
  assert.deepEqual([...fixture.children], originalOrder);
  assert.equal(document.querySelector('#acy-0'), null);
});

test('6. Alt-click on a link prevents the native click default', async t => {
  const { link, key, mouse } = await loadContentScript(t);
  key();
  const click = mouse(link, 'click');
  assert.equal(click.defaultPrevented, true);
  assert.equal(link.isConnected, false);
});

test('7. Window blur clears the highlight and disables Alt mode', async t => {
  const { window, document, a, b, key, mouse } = await loadContentScript(t);
  key();
  mouse(a);
  assert.ok(a.classList.contains('mouseOn'));
  window.dispatchEvent(new window.Event('blur'));
  assert.equal(document.querySelector('.mouseOn'), null);
  mouse(b);
  assert.equal(document.querySelector('.mouseOn'), null);
});

test('8. Repeated Alt keydowns release cleanly and Alt mode remains usable', async t => {
  const { document, fixture, a, b, undo, key, mouse } = await loadContentScript(t);
  key();
  key('keydown', { repeat: true });
  key('keydown', { repeat: true });
  mouse(a);
  assert.ok(a.classList.contains('mouseOn'));
  key('keyup');
  assert.equal(document.querySelector('.mouseOn'), null);
  mouse(a);
  assert.equal(document.querySelector('.mouseOn'), null);
  key();
  mouse(a);
  assert.deepEqual([...document.querySelectorAll('.mouseOn')], [a]);
  mouse(a, 'click');
  mouse(b, 'click');
  key('keydown', { repeat: true });
  key('keydown', { repeat: true });
  mouse(undo, 'click', { shiftKey: true });
  // Duplicate click handlers would undo A as well as the most recent removal B.
  assert.equal(b.parentElement, fixture);
  assert.equal(a.isConnected, false);
  assert.ok(document.querySelector('#acy-0'));
  assert.equal(document.querySelector('#acy-2'), null);
});

test('9. Alt keydown with Meta, Control, or Shift does not activate the mode', async t => {
  const { document, fixture, a, key, mouse } = await loadContentScript(t);
  for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey']) {
    key('keydown', { [modifier]: true });
    mouse(a);
    assert.equal(document.querySelector('.mouseOn'), null, modifier);
    const click = mouse(a, 'click');
    assert.equal(a.parentElement, fixture, modifier);
    assert.equal(click.defaultPrevented, false, modifier);
  }
});
