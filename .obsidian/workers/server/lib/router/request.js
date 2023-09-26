const url = require("url");

class Request {
  constructor(httpRequest) {
    this.method = httpRequest.method;
    this.path = httpRequest.url;
    this.headers = httpRequest.headers;
    this.body = "";
    this.params = {};
    this.query = url.parse(this.path, true).query;
    this.files = [];  
    // Listen for data events to collect request body
    httpRequest.on("data", (chunk) => {
      this.body += chunk.toString();
    });

    // Listen for end event to mark request as complete
    httpRequest.on("end", () => {
      // You can add any additional request processing here
    });
  }

  static body = this.body;
  static headers = this.headers;
  static method = this.method;
  static path = this.path;
  static query = this.query;
  static params = this.params;
  static files = this.files;
  static file = this.files[0];
  
  getFilesFromRequest() {
    const files = [];
    const boundary = this.headers["content-type"].split("=")[1];
    const parts = this.body.split(boundary);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes("filename")) {
        const file = {};
        const fileDetails = parts[i].split("\r\n")[1];
        const fileData = parts[i].split("\r\n")[4];
        const fileName = fileDetails.split("=")[2].replace(/"/g, "");
        const fileType = fileDetails.split("=")[3].replace(/"/g, "");
        file.name = fileName;
        file.type = fileType;
        file.data = fileData;
        files.push(file);
      }
    }
    this.files = files;
    return files;
  }


  getBodyAsJSON() {
    try {
      return JSON.parse(this.body);
    } catch (error) {
      return null;
    }
  }


}

module.exports = {
  Request,
};
