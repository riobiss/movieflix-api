const http = require("http");

const port = 3000;

const server = http.createServer((req : any, res:any) => {
  res.setHeader("Content-type", "text/plain");
  if (req.url === "/") {
    res.statusCode = 200;
    res.end("Home page");
  } else if (req.url === "/about") {
    res.statusCode = 200;
    res.end("About Page");
  }
});

server.listen(port, () => {
  console.log("🚀Server open in the port: " + port);
});
