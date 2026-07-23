// Source file to trigger ESLint execution against the PR. Contains intentional lint issues.
var unusedValue = 1;
function helper(a) {
  if (a == "1") {
    return "loose equality and unused variable are lint issues";
  }
}
module.exports = { helper };
