
const obsidian = require("../obsidian.js");
const path = require("path");

const app = obsidian();

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use(path.join(__dirname, "./routes.js"),"/jj");
app.listen(3000, () => {
  console.log("Log");
});


