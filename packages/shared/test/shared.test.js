'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { locations, questions, filterLocations, gradeQuiz, toPublicQuestions } = require('../index.js');

test('catalog has unique IDs, usable coordinates, explicit limitations and primary sources', () => {
  assert.equal(locations.length, 10);
  assert.equal(new Set(locations.map((location) => location.id)).size, locations.length);
  for (const location of locations) {
    assert.ok(Number.isFinite(location.lat) && Math.abs(location.lat) <= 90);
    assert.ok(Number.isFinite(location.lng) && Math.abs(location.lng) <= 180);
    assert.ok(location.limitation.length > 50);
    assert.ok(['Mars', 'Oy', 'Ikkalasi'].includes(location.target));
    assert.ok(location.sources.length);
    for (const source of location.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.match(url.hostname, /(^|\.)(nasa\.gov|esa\.int|usgs\.gov)$/);
    }
  }
});

test('no fabricated imagery: a remote image requires an explicit credit', () => {
  for (const location of locations) {
    assert.equal(Boolean(location.image), Boolean(location.imageCredit), location.id);
  }
});

test('search accepts Uzbek apostrophe variants, case and multiple words', () => {
  assert.ok(filterLocations({ q: "CHO'L   CHILI" }).some((location) => location.id === 'atacama'));
  assert.ok(filterLocations({ q: 'rio   TINTO' }).some((location) => location.id === 'rio-tinto'));
  assert.deepEqual(filterLocations({ q: '[.*' }), []);
});

test('planet filters include shared analogs and combine with terrain', () => {
  const moonVolcanoes = filterLocations({ target: 'Oy', terrain: 'Vulqon' });
  assert.deepEqual(moonVolcanoes.map((location) => location.id), ['mauna-kea', 'lanzarote', 'askja']);
  assert.equal(filterLocations({ target: 'Mars', terrain: 'Daryo' })[0].id, 'rio-tinto');
  assert.equal(filterLocations({ target: 'barchasi' }).length, locations.length);
  assert.deepEqual(filterLocations({ target: 'Pluto' }), []);
});

test('search rejects structured input instead of coercing objects', () => {
  for (const input of [null, [], 'Mars', { q: { $ne: null } }, { target: 1 }, { terrain: [] }]) {
    assert.throws(() => filterLocations(input), TypeError);
  }
});

test('quiz data references known locations and valid options', () => {
  assert.equal(questions.length, 7);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(locations.some((location) => location.id === question.locationId));
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
    assert.equal(new Set(question.options).size, question.options.length);
  }
});

test('public questions never expose the answer key', () => {
  const publicList = toPublicQuestions();
  assert.equal(publicList.length, questions.length);
  for (const question of publicList) {
    assert.equal('answer' in question, false);
    assert.equal('explanation' in question, false);
    assert.ok(question.prompt && question.options.length);
  }
  assert.equal(toPublicQuestions(questions.slice(0, 1)).length, 1);
});

test('quiz grades mixed, full and single-question attempts without mutating answers', () => {
  const full = questions.map((question) => ({ questionId: question.id, answer: question.answer }));
  const snapshot = structuredClone(full);
  assert.equal(gradeQuiz(full).score, 7);
  assert.deepEqual(full, snapshot);
  const partial = gradeQuiz([{ questionId: 'atacama-dryness', answer: 0 }, { questionId: 'lanzarote-basalt', answer: 0 }]);
  assert.equal(partial.score, 1);
  assert.equal(partial.total, 2);
  assert.equal(partial.results[0].correctAnswer, 1);
  assert.equal(gradeQuiz([full[0]]).total, 1);
});

test('quiz rejects empty, duplicate, unknown, invalid and sparse answer sets', () => {
  const valid = { questionId: questions[0].id, answer: questions[0].answer };
  for (const input of [undefined, null, {}, [], [null], [[]], [valid, valid], [{ questionId: 'missing', answer: 0 }], new Array(1)]) {
    assert.throws(() => gradeQuiz(input), TypeError);
  }
  for (const answer of [-1, 4, 0.5, NaN, Infinity, '1', null, true, undefined]) {
    assert.throws(() => gradeQuiz([{ questionId: valid.questionId, answer }]), TypeError);
  }
});
