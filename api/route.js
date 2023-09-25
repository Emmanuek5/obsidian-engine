const { Router } = require("../modules");
const router = new Router();
const usersModel = require("../models/users");


usersModel.insert({
  username: "admin",
  password: "admin",
  email: "  ",
});

router.basePath = "/";

router.get("/", (req, res) => {
  const user = usersModel.find({username: "admin"})
  res.send(user.toString());
});


module.exports = router;