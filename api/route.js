const { Router } = require("../modules");
const router = new Router();


router.basePath = "/";

router.get("/", (req, res) => {
  res.send("Hello World!");
});


module.exports = router;