const { Router } = require("../modules");
const router = new Router();



//visit http://localhost:3000/api/
router.basePath = "/";

router.get("/", (req, res) => {
  res.send("Hello World");
});


module.exports = router;