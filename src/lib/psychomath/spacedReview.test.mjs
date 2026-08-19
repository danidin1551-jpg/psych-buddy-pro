import assert from "node:assert/strict";
import { computeNextInterval, getDueReviews, isLeech } from "./spacedReview.ts";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 1. הצלחה ראשונה — מרווח יום אחד
{
  const now = Date.now();
  const result = computeNextInterval({}, true, now);
  assert.equal(result.intervalDays, 1);
  assert.equal(result.failCount, 0);
  assert.equal(result.nextReviewAt, now + MS_PER_DAY);
}

// 2. רצף הצלחות מכפיל מרווח
{
  const now = Date.now();
  let interval = 1;
  let state = { intervalDays: undefined, failCount: 0 };

  const step = (expectedDays) => {
    state = computeNextInterval(state, true, now);
    assert.equal(state.intervalDays, expectedDays);
    assert.equal(state.failCount, 0);
  };

  step(1);
  step(3);
  step(7);
  step(21);
  step(45);
  // מעבר 45 → כפול ~2.5
  state = computeNextInterval(state, true, now);
  assert.equal(state.intervalDays, 113);
}

// 3. כישלון מאפס מרווח ומעלה failCount
{
  const now = Date.now();
  const result = computeNextInterval({ intervalDays: 7, failCount: 1 }, false, now);
  assert.equal(result.intervalDays, 1);
  assert.equal(result.failCount, 2);
  assert.equal(result.nextReviewAt, now + MS_PER_DAY);
}

// 4. הצלחה אחרי כישלון מאפסת failCount
{
  const now = Date.now();
  const result = computeNextInterval({ intervalDays: 3, failCount: 2 }, true, now);
  assert.equal(result.intervalDays, 7);
  assert.equal(result.failCount, 0);
}

// 5. זיהוי leech
{
  const due = { failCount: 3 };
  const notDue = { failCount: 2 };
  assert.equal(isLeech(due), true);
  assert.equal(isLeech(notDue), false);
}

// 6. getDueReviews — מסנן וממיין לפי דחיפות
{
  const now = 1000000000000;
  const question = {
    type: "numeric",
    typeLabel: "כפל בעל פה",
    groupLabel: "כפל וחילוק",
    text: "2 × 3 = ?",
    answer: 6,
    explanation: "2*3",
    signature: "x",
    sourceCategory: "multiplication",
  };

  const missed = [
    { question, givenAnswer: "5", at: now, nextReviewAt: now + MS_PER_DAY, intervalDays: 1, failCount: 0 },
    { question, givenAnswer: "4", at: now, nextReviewAt: now - 1000, intervalDays: 3, failCount: 0 },
    { question, givenAnswer: "3", at: now, nextReviewAt: now - MS_PER_DAY, intervalDays: 7, failCount: 0 },
    { question, givenAnswer: "7", at: now, nextReviewAt: now + MS_PER_DAY, intervalDays: 1, failCount: 0 },
  ];

  const due = getDueReviews(missed, now);
  assert.equal(due.length, 2);
  assert.equal(due[0].nextReviewAt, now - MS_PER_DAY);
  assert.equal(due[1].nextReviewAt, now - 1000);
}

console.log("spacedReview tests passed");
