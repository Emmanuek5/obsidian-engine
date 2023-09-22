
// lib/response.js
class Response {
  constructor(httpResponse) {
    this.response = httpResponse;
    this.statusCode = 200; // Default status code is 200 OK
    this.headers = {
      "Content-Type": "text/html", // Default content type is plain text
    };
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

  file(file) {
    this.setHeader("Content-Type", "text/html");
    this.body = fs.readFileSync(file, "utf8");
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }

  json(body) {
    this.setHeader("Content-Type", "application/json");
    this.body = JSON.stringify(body);
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }

  render(file) {
    
  }

 
  
}

module.exports = {
  Response,
};
