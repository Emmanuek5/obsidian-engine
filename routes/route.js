const { Router } = require("../modules");
const router = new Router();
const usersModel = require("../models/users");


//visit http://localhost:3000/api/
router.basePath = "/";1

router.get("/", (req, res) => {
  usersModel.insert({ username: "test", password: "test" , email: "test"});
  res.send("Hello World");
});


module.exports = router;