const fs = require("fs");
const path = require("path");
const { RenderEngines } = require("../utils/Engines");
// lib/response.js
class Response {
  constructor(httpResponse) {
    this.response = httpResponse;
    this.statusCode = 200; // Default status code is 200 OK
    this.headers = {
      "Content-Type": "text/html", // Default content type is plain text
    };
    this.mainPath = process.cwd() + "/pages";
    this.rendered = false;
    this.renderedFile = "";
    this.viewEngine = this.response.viewEngine;
    this.body = "";
  }

  setStatus(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  setHeader(header, value) {
    this.headers[header] = value;
    return this;
  }

  send(body) {
    this.body = body;
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }

  file(filePath) {
    if (fs.existsSync(filePath)) {
      this.body = fs.readFileSync(filePath);
      this.rendered = true;
      this.setHeader("Content-Type", "application/octet-stream"); // Set the appropriate content type based on the file type
      this.response.writeHead(this.statusCode, this.headers);
      this.response.end(this.body);
    } else {
      // Handle the case where the file does not exist
      this.setStatus(404).send("File not found");
    }
    return this;
  }

  json(body) {
    this.setHeader("Content-Type", "application/json");
    this.body = JSON.stringify(body);
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }

  render(file, options) {
    if (this.viewEngine) {
     if (this.viewEngine == "html") {
       const renderEngine = new RenderEngines();
       const engine = renderEngine.getRenderer(this.viewEngine);
       this.body = engine(file, options);
       this.rendered = true;
       this.setHeader("Content-Type", "text/html");
       this.response.writeHead(this.statusCode, this.headers);
       this.response.end(this.body);
       return this;
      
     }
    } else {
      this.renderedFile = path.join(this.mainPath, file+".html");
      this.rendered = true;
      this.setHeader("Content-Type", "text/html");
      this.body = fs.readFileSync(this.renderedFile, "utf8");
      this.response.writeHead(this.statusCode, this.headers);
      this.response.end(this.body);
      return this;
    }
  }
}

module.exports = {
  Response,
};
