// In your routes/myRouter.js file
const obsidian = require("../obsidian.js");
const router = new obsidian.Router();

router.get("/", (req, res) => {
    res.send("Hello Dee Nuts");
    }
);

module.exports = router;
