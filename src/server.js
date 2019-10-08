const express = require("express");
const app = express();
const port = 3000;
const PDFDocument = require("./extension");
const fs = require("fs");

const createPDF = () => {
  // Note: All numbers are in inches.
  // Note: You can do method chaining.
  const doc = new PDFDocument({
    size: "A4", // default is 'Letter'. Find full list of sizes here: https://github.com/foliojs/pdfkit/blob/b13423bf0a391ed1c33a2e277bc06c00cabd6bf9/lib/page.coffee#L72-L122
    margin: 50, // inches. Unless stated otherwise, this margin is for all sides.
    layout: "landscape", // default is portrait. Two available choices: 'landscape' or 'portrait'.
    info: {
      Title: "Title of doc", // Appears as the title of PDF. This is not the name of the PDF file.
      Author: "I am ze author", // PDF prop
      Subject: "This is subject kun" // PDF prop
    },
    // userPassword: "abc123", // you can lock the PDF with a password.
    // Choose a version to decrypt the PDF. Check available versions here: https://pdfkit.org/docs/getting_started.html#encryption_and_access_privileges
    pdfVersion: "1.3",
    permissions: {
      // You can check what permission is there here: https://pdfkit.org/docs/getting_started.html#encryption_and_access_privileges
      printing: "lowResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false
    }
  });

  // Add text in new line. Text align defaults to left.
  // You can set text align 'left', 'right', 'center', 'justify'.
  doc
    .font("Helvetica")
    .fontSize(22)
    .text("Whoa there a new line!", { width: 400, align: "right" })
    // Move down/Move up by X line. Defaults to 1 line if nothing specified.
    .moveDown()
    .moveUp(2)
    .moveDown(2);

  // Add texts at (x, y) === (100, 100) position.
  doc
    .font("Courier")
    .fontSize(12)
    .text("Hello world!", 150, 90);

  // Creates 1-dimension list at (x, y), with options
  // You can create multilists by using nested array.
  doc
    .font("Helvetica")
    .list(["First", "Second", "Third"], 20, 20, {
      bulletRadius: 10,
      textIndent: 20,
      bulletIndent: 20
    })
    .list(["Flavours", ["Chocolate", "Vanilla"]], {
      bulletRadius: 3
    });

  // Add image with set width
  doc
    .image("src/sgcc-logo.png", 300, 200, { width: 50 })
    .text("Width set", 300, 250);

  // Force image to fit within dimensions
  doc
    .image("src/sgcc-logo.png", 400, 200, { fit: [20, 20] })
    .rect(400, 200, 20, 20)
    .stroke()
    .text("Fit fit!", 400, 220);

  // Scale the image
  doc
    .image("src/sgcc-logo.png", 500, 200, { scale: 0.25 })
    .text("Scale!", 500, 200);

  // We can overwrite initial options!
  doc.addPage({
    layout: "portrait",
    margins: {
      top: 10,
      bottom: 20,
      left: 30,
      right: 40
    }
  });

  // Added custom font
  doc.font("src/Lato-Regular.woff").text("Page 2!");

  // Draw a line
  doc
    .moveTo(20, 40)
    .lineTo(50, 50)
    .quadraticCurveTo(130, 200, 150, 120)
    .bezierCurveTo(190, -40, 200, 200, 300, 150)
    .stroke();

  // Draw a rectangle
  // x, y, width, height
  doc.rect(50, 100, 20, 20).stroke();

  // Draw a rectangle with corner radius and red fill
  // x, y, width, height, cornerRadius
  doc.roundedRect(50, 150, 30, 30, 5).fill("red");

  // Draw a polygon
  doc.polygon([100, 0], [50, 100], [150, 100]).stroke();

  // Draw a circle with dashes
  // cx, cy, radius
  doc
    .circle(50, 200, 40)
    .dash(5, { space: 10 })
    .stroke();

  // This command flushes the PDF pages for us
  doc.end();

  return doc;
};

const createInvoicePDF = () => {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 80, bottom: 80, left: 50, right: 50 },
    layout: "portrait",
    info: {
      Title: "Invoice 0009 - SGCC",
      Author: "SG Code Campus"
    },
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false
    }
  });
  const logoSVG = fs.readFileSync("src/logo.svg", "utf8");
  const getUsableWidth = me => {
    return me.page.width - me.page.margins.left - me.page.margins.right;
  };

  doc
    .rect(
      doc.page.margins.left,
      80,
      doc.page.width - doc.page.margins.left * 2,
      doc.page.height - doc.page.margins.top * 2
    )
    .stroke();

  doc.addSVG(logoSVG, doc.page.margins.left, -330, { width: 120 });

  doc
    .fontSize(23)
    .fillColor("grey")
    .text("INVOICE", {
      characterSpacing: 0.8,
      align: "right",
      font: "Helvetica-Bold"
    });

  doc
    .fillColor("black")
    .fontSize(12)
    .lineGap(3)
    .font("src/Lato-Regular.woff")
    .text("Misty")
    .text("info@ceruleangym.com");

  doc
    .rect(
      getUsableWidth(doc) * 0.8,
      105,
      getUsableWidth(doc) * 0.2 + doc.page.margins.right,
      20
    )
    .fill("green");

  doc
    .font("Helvetica-Bold")
    .fill("white")
    .fontSize(11)
    .text("Paid", getUsableWidth(doc) * 0.8 + 5, 110);

  doc
    .font("src/Lato-Regular.woff")
    .fontSize(12)
    .lineGap(0)
    .fill("black")
    .text("Invoice #:  0009", getUsableWidth(doc) * 0.8, 180, { align: "left" })
    .text("Invoice Date:  Oct 1, 2019", { align: "left" })
    .text("Due Date:  Oct 11, 2019", { align: "left" });

  doc
    .roundedRect(
      getUsableWidth(doc) * 0.8,
      250,
      getUsableWidth(doc) * 0.2 + doc.page.margins.right,
      50,
      5
    )
    .stroke("grey")
    .lineWidth(2);

  doc
    .font("src/Lato-Regular.woff")
    .fill("black")
    .fontSize(12)
    .text("Amount due:", getUsableWidth(doc) * 0.8, 260, { align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fill("black")
    .text("5000P", getUsableWidth(doc) * 0.8, 275, { align: "center" });

  doc
    .moveTo(doc.page.margins.left - 20, 320)
    .lineTo(getUsableWidth(doc) + doc.page.margins.right + 20, 320)
    .lineWidth(1)
    .stroke("grey");

  doc
    .font("Helvetica")
    .fontSize(13)
    .fill("black")
    .text("Bill To:", doc.page.margins.left, 340)
    .moveDown()
    .font("src/Lato-Regular.woff")
    .fontSize(12)
    .text("Ash Ketchum")
    .text("5, Pallet Town, Kanto")
    .moveDown()
    .text("forever10@gmail.com")
    .text("+65 1234 1234");

  const table0 = {
    headers: ["Description", "Quantity", "Price", "Amount"],
    rows: [["Give me back my bike money", "1", "5000P", "5000P"]]
  };

  doc.table(table0, {
    y: 480,
    options: {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: () =>
        doc
          .font("src/Lato-Regular.woff")
          .fontSize(12)
          .fill("black")
    }
  });

  const table1 = {
    headers: ["", ""],
    rows: [["Subtotal", "5000P"], ["Total", "5000P"]]
  };

  doc.table(table1, {
    x: getUsableWidth(doc) * 0.85,
    y: 540,
    options: {
      prepareRow: () =>
        doc
          .font("src/Lato-Regular.woff")
          .fontSize(11)
          .fill("black"),
      width: getUsableWidth(doc) * 0.15 + doc.page.margins.right
    }
  });

  doc.end();

  return doc;
};

// Root
app.get("/", (req, res) => {
  res.send(`Hello world`);
});

// Show pdf as iframe
app.get("/as-iframe", (req, res) => {
  res.send(`As iframe <iframe src="/output" />`);
});

// Show pdf as a stream. Doesn't save onto server.
app.get("/output", (req, res) => {
  res.contentType("application/pdf");

  // const doc = createPDF();
  const doc = createInvoicePDF();

  doc.pipe(res);
});

// Saves a copy onto server.
app.get("/save-to-server", (req, res) => {
  // const doc = createPDF();
  const doc = createInvoicePDF();

  doc.pipe(fs.createWriteStream("Invoice 0009 - SGCC.pdf"));

  res.end("Done! Check project root.");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
