var express = require("express");
var app = express();
app.get("/", function(req, res) {
  res.send("Hello Worlxxxxd!");
});
// This is REQUIRED for IISNODE to work
app.listen(process.env.PORT, () => {
  console.log("listening");
});