const { Router } = require("../modules");
const router = new Router();
const usersModel = require("../models/users");


usersModel.find({}).then((users) => {
  console.log(users);
});


//visit http://localhost:3000/api/
router.basePath = "/";

router.get("/", (req, res) => {
  res.send("Hello World");
});


module.exports = router;