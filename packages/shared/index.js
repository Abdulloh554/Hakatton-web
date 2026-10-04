'use strict';

const locations = require('./data/locations.json');
const questions = require('./data/questions.json');
const questionsById = new Map(questions.map((question) => [question.id, question]));

function normalize(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/['‘’ʻʼ`]/g, '').toLowerCase().trim();
}

/** Pure filtering; never interprets user input as a regex or database query. */
function filterLocations(query = {}, catalog = locations) {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new TypeError('Qidiruv filtri obyekt bo‘lishi kerak.');
  }
  if (!Array.isArray(catalog)) {
    throw new TypeError('Katalog ro‘yxat bo‘lishi kerak.');
  }
  for (const field of ['q', 'target', 'terrain']) {
    if (query[field] !== undefined && typeof query[field] !== 'string') {
      throw new TypeError(`${field} matn bo‘lishi kerak.`);
    }
  }
  const terms = normalize(query.q || '').split(/\s+/).filter(Boolean);
  const target = normalize(query.target || '');
  const terrain = normalize(query.terrain || '');
  const all = (value) => !value || value === 'all' || value === 'barchasi';

  return catalog.filter((location) => {
    const destination = normalize(location.target);
    const includesBoth = destination === 'ikkalasi' && (target === 'mars' || target === 'oy');
    if (!all(target) && destination !== target && !includesBoth) return false;
    if (!all(terrain) && normalize(location.terrain) !== terrain) return false;
    const searchable = normalize([location.id, location.name, location.country, location.target,
      location.terrain, location.summary, location.explanation, ...location.features].join(' '));
    return terms.every((term) => searchable.includes(term));
  });
}

/** Supports either a single bot answer or a full quiz; total is the submitted count. */
function gradeQuiz(answers) {
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > questions.length) {
    throw new TypeError('Kamida bitta va ko‘pi bilan barcha savollarga javob yuboring.');
  }
  const seen = new Set();
  const results = [];
  // for...of also visits sparse-array holes, so malformed input cannot bypass validation.
  for (const entry of answers) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.questionId !== 'string') {
      throw new TypeError('Har bir javobda savol identifikatori va variant raqami bo‘lishi kerak.');
    }
    const question = questionsById.get(entry.questionId);
    if (!question) throw new TypeError('Noma’lum savol.');
    if (seen.has(entry.questionId)) throw new TypeError('Bir savolga ikki marta javob berib bo‘lmaydi.');
    if (!Number.isInteger(entry.answer) || entry.answer < 0 || entry.answer >= question.options.length) {
      throw new TypeError('Javob varianti noto‘g‘ri.');
    }
    seen.add(entry.questionId);
    results.push({
      questionId: question.id,
      correct: entry.answer === question.answer,
      correctAnswer: question.answer,
      explanation: question.explanation,
    });
  }
  return { score: results.filter((result) => result.correct).length, total: results.length, results };
}

/** Strips the answer key so a client bundle or API payload can never pre-compute the score. */
function toPublicQuestions(list = questions) {
  return list.map(({ answer, explanation, ...rest }) => rest);
}

module.exports = { locations, questions, filterLocations, gradeQuiz, toPublicQuestions };
