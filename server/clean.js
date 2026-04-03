const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('C:/Users/km/Glamour/GlamourApp/server/database.sqlite');
db.run("DELETE FROM nav_categories WHERE slug='tops-bodys'", (err) => {
  if (err) console.error(err);
  else console.log("CLEANED UP");
  process.exit(0);
});
