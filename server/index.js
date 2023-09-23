const { server, Config } = require("../modules");
const app = server();
const config = new Config();
const port = config.get("port");
const path = require("path");
const fs = require("fs");
const defaultPath = process.cwd();
const pagesPath = path.join(defaultPath, "pages");

if (fs.existsSync(pagesPath) && fs.lstatSync(pagesPath).isDirectory()) {
  fs.readdirSync(pagesPath).forEach((folder) => {
    const folderPath = path.join(pagesPath, folder);
    if (fs.lstatSync(folderPath).isDirectory()) {
      fs.readdirSync(folderPath).forEach((file) => {
        if (file.endsWith(".html")) {
          const filePath = path.join(folderPath, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          const routeMatch = fileContent.match(/<route>([^<]+)<\/route>/);
          let route;

          if (routeMatch) {
            route = routeMatch[1].trim();
          } else if (folder === "pages") {
            route = `/${file.slice(0, -5)}`;
          } else if (file === "index.html") {
            route = `/${folder}`;
          } else {
            route = `/${folder}/${file.slice(0, -5)}`;
          }

          app.get(route, (req, res) => {
            // Render the page corresponding to the route
            // You can customize this part based on your rendering logic
            res.render(`${folder}/${file.slice(0, -5).replace(".html","")}`, {});
          });
        }
      });
    } else {
      if (folder.endsWith(".html")) {
        const filePath = path.join(pagesPath, folder);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const routeMatch = fileContent.match(/<route>([^<]+)<\/route>/);
        let route;

        if (routeMatch) {
          route = routeMatch[1].trim();
        } else if (folder === "pages") {
          route = `/${folder.slice(0, -5)}`;
        } else if (folder === "index.html") {
          route = "/";
        } else {
          route = `/${folder.slice(0, -5)}`;
        }

        app.get(route, (req, res) => {
          // Render the page corresponding to the route
          // You can customize this part based on your rendering logic
          res.render(folder.replace(".html",""), {params: req.params()});
        });
      }
    }
  });
} else {
  throw new Error("The pages folder does not exist");
}

app.use("/assets", path.join(process.cwd(), "/public"));
app.use("/scripts", path.join(process.cwd(), "/public/js"));
app.post("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, (port) => {
  console.log(`Server listening on http://localhost:${port}`);
});
