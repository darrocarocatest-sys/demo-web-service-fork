const test = require("node:test");
const assert = require("node:assert/strict");

const { applyDiscount } = require("../src/coupon.js");

test("applyDiscount computes the discounted price for a typical percent", () => {
  assert.equal(applyDiscount(100, 20), 80);
});

test("applyDiscount returns the original price when percent is 0", () => {
  assert.equal(applyDiscount(50, 0), 50);
});

test("applyDiscount returns 0 when percent is 100", () => {
  assert.equal(applyDiscount(50, 100), 0);
});

test("applyDiscount handles decimal percents", () => {
  assert.equal(applyDiscount(90, 33.33), 90 - (90 * 33.33) / 100);
});

test("applyDiscount handles decimal prices", () => {
  assert.equal(applyDiscount(19.99, 10), 19.99 - (19.99 * 10) / 100);
});

test("applyDiscount throws when percent is negative", () => {
  assert.throws(() => applyDiscount(100, -1), {
    message: "percent out of range",
  });
});

test("applyDiscount throws when percent is greater than 100", () => {
  assert.throws(() => applyDiscount(100, 101), {
    message: "percent out of range",
  });
});

test("applyDiscount treats the 0 and 100 boundaries as valid (inclusive range)", () => {
  assert.doesNotThrow(() => applyDiscount(100, 0));
  assert.doesNotThrow(() => applyDiscount(100, 100));
});

test("applyDiscount returns 0 when price is 0, regardless of valid percent", () => {
  assert.equal(applyDiscount(0, 50), 0);
});

test("applyDiscount does not clamp or validate a negative price (documents current behavior)", () => {
  // The function only validates `percent`, not `price`. A negative price
  // is passed through the same formula, producing a negative-magnitude
  // result. This test pins down existing behavior so any future change
  // to price validation is a deliberate, visible change.
  assert.equal(applyDiscount(-100, 20), -80);
});