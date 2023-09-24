const { server, Config } = require("../../modules");
const app = server();
const config = new Config();
const port = config.get("port");
const path = require("path");
const fs = require("fs");

const defaultPath = process.cwd();
const pagesPath = path.join(defaultPath, "pages");
const routesPath = path.join(defaultPath, "routes");

if (fs.existsSync(pagesPath) && fs.lstatSync(pagesPath).isDirectory()) {
  fs.readdirSync(pagesPath).forEach((folder) => {
    const folderPath = path.join(pagesPath, folder);
    if (
      fs.lstatSync(folderPath).isDirectory() &&
      folder.startsWith("[") &&
      folder.endsWith("]")
    ) {
      const folderKey = folder.slice(1, -1); // Extract the key from "[key]"
      fs.readdirSync(folderPath).forEach((file) => {
        if (file.endsWith(".html")) {
          const fileName = file.slice(0, -5); // Remove ".html" extension
          const route =
            fileName === "index"
              ? `/${folderKey}` // Register index file as /
              : fileName.startsWith("[") && fileName.endsWith("]")
              ? `/:${folderKey}/:${fileName.slice(1, -1)}`
              : `/:${folderKey}/${fileName}`;
          registerRoute(route, folder, fileName);
        }
      });
    } else if (folder.endsWith(".html")) {
      const fileName = folder.slice(0, -5); // Remove ".html" extension
      const route =
        fileName === "index"
          ? "/" // Register index file as /s
          : fileName.startsWith("[") && fileName.endsWith("]")
          ? `/:${fileName.slice(1, -1)}`
          : `/${fileName}`;
          
      registerRoute(route, "/", fileName);
    }
  });
} else {
  throw new Error("The pages folder does not exist");
}

function registerRoute(route, folder, fileName) {
  app.get(route, (req, res) => {
    // Render the page corresponding to the route
    // You can customize this part based on your rendering logic
    const params = req.params;
    path.join(process.cwd(), `/pages/${folder}/${fileName}`);
    const filename = path.basename(`${folder}/${fileName}`);
    res.render(`${folder}/${filename}`, params);
  });
}

app.use("/public", path.join(process.cwd(), "/public"));
app.use("/scripts", path.join(process.cwd(), "/public/js"));
app.use("/styles", path.join(process.cwd(), "/public/css"));

app.post("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, (port) => {
  console.log(`Server listening on http://localhost:${port}`);
});
