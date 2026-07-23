// Small utility so ESLint has a changed JS file to analyze.
function clamp(n, lo, hi) {
  var x = n
  if (x < lo) x = lo
  if (x > hi) x = hi
  return x
}

module.exports = { clamp };
