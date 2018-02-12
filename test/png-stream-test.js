const test = require('tape');
const split = require('../lib/split-png-stream');
const stream = require('stream');

test('single png stream', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [[137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]]);
    t.end();
  }, t.end.bind(t));
});

test('2 pngs stream', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3,
    137, 80, 78, 71, 13, 10, 26, 10, 4, 5, 6]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3],
      [137, 80, 78, 71, 13, 10, 26, 10, 4, 5, 6],
    ]);
    t.end();
  }, t.end.bind(t));
});

test('unmatched sequence', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3,
    137, 80, 78, 71, 4, 5, 6]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 137, 80, 78, 71, 4, 5, 6],
    ]);
    t.end();
  }, t.end.bind(t));
});

test('unmatched sequence in the second png', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 7, 6, 5,
    137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3,
    137, 80, 78, 71, 4, 5, 6]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 7, 6, 5],
      [137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 137, 80, 78, 71, 4, 5, 6],
    ]);
    t.end();
  }, t.end.bind(t));
});

test('single non matching byte', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 137, 137, 137,
    137, 80, 78, 71, 13, 10, 26, 10, 137, 137, 137]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 137, 137],
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 137, 137],
    ]);
    t.end();
  }, t.end.bind(t));
});

test('two non matching bytes', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 137, 80,
    137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 137, 80]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 137, 80],
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 137, 80],
    ]);
    t.end();
  }, t.end.bind(t));
});

test('three non matching bytes', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 78, 137, 80, 78,
    137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 78, 137, 80, 78]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 78, 137, 80, 78],
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 78, 137, 80, 78],
    ]);
    t.end();
  }, t.end.bind(t));
});

test('ending with the sequence', (t) => {
  const s = new stream.PassThrough();
  s.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 78, 137, 80, 78,
    137, 80, 78, 71, 13, 10, 26, 10]));

  const bufs = [];
  split(s, buf => bufs.push([...buf]), () => {
    t.deepEqual(bufs, [
      [137, 80, 78, 71, 13, 10, 26, 10, 137, 80, 78, 137, 80, 78],
    ]);
    t.end();
  }, t.end.bind(t));
});
