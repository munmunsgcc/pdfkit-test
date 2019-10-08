const express = require("express");
const app = express();
const port = 3000;
const PDFDocument = require("pdfkit");
const fs = require("fs");

app.get("/", (req, res) => {
  res.send(`Hello world <iframe src="/show-in-browser" />`);
});

app.get("/show-in-browser", (req, res) => {
  const doc = new PDFDocument();

  res.contentType("application/pdf");

  doc.pipe(res);

  doc.text("Hello world!", 100, 100);

  doc.end();
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
