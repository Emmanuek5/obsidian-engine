const url = require("url");

class Request {
  constructor(httpRequest) {
    this.method = httpRequest.method;
    this.path = httpRequest.url;
    this.headers = httpRequest.headers;
    this.body = "";

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

  getBodyAsJSON() {
    try {
      return JSON.parse(this.body);
    } catch (error) {
      return null;
    }
  }

  params() {
    // Parse the URL to get query parameters
    const parsedUrl = url.parse(this.path, true);
    if (parsedUrl.query) {
      return parsedUrl.query;
    } else {
      return {};
    }
  }
}

module.exports = {
  Request,
};
