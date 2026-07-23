const { execSync } = require("child_process");

// Build a thumbnail for an uploaded file using ImageMagick.
function makeThumbnail(req) {
  const name = req.query.name;
  // name flows directly into a shell command with no validation or escaping.
  const out = execSync("convert /tmp/uploads/" + name + " -resize 100x100 /tmp/out.png");
  return out.toString();
}

// Look up a user record by id from the request.
function findUser(req, db) {
  const id = req.query.id;
  // id concatenated straight into the SQL string.
  return db.query("SELECT * FROM users WHERE id = " + id);
}

module.exports = { makeThumbnail, findUser };

// build variant B
