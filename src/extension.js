"use strict";

const PDFDocument = require("pdfkit");
const SVGtoPDF = require("svg-to-pdfkit");

// TODO: Let user programmatically set each text's alignment, font size and font family.
// TODO: Let user programmatically set borders.
// TODO: Be lenient if no headers are found.
// 1. Let user customize each row. Let them set background color and border.
// 2. There will not be any header. Do each row manually.
PDFDocument.prototype.table = function(table, { x, y, options = {} }) {
  let startX = x || this.page.margins.left;
  let startY = y || this.y;

  const columnCount = table.headers.length;
  const columnSpacing = options.columnSpacing || 15;
  const rowSpacing = options.rowSpacing || 5;
  const usableWidth =
    options.width ||
    this.page.width - this.page.margins.left - this.page.margins.right;

  const prepareHeader = options.prepareHeader || (() => {});
  const prepareRow = options.prepareRow || (() => {});
  const computeRowHeight = row => {
    let result = 0;

    row.forEach(cell => {
      const cellHeight = this.heightOfString(cell, {
        width: columnWidth,
        align: "left"
      });

      result = Math.max(result, cellHeight);
    });

    return result + rowSpacing;
  };

  const columnContainerWidth = usableWidth / columnCount;
  const columnWidth = columnContainerWidth - columnSpacing;
  const maxY = this.page.height - this.page.margins.bottom;

  let rowBottomY = 0;

  this.on("pageAdded", () => {
    startY = this.page.margins.top;
    rowBottomY = 0;
  });

  // Allow the user to override style for headers
  prepareHeader();

  // Check to have enough room for header and first rows
  if (startY + 3 * computeRowHeight(table.headers) > maxY) {
    this.addPage();
  }

  // Print all headers
  table.headers.forEach((header, i) => {
    this.text(header, startX + i * columnContainerWidth, startY, {
      width: columnWidth,
      align: "left"
    });
  });

  // Refresh the y coordinate of the bottom of the headers row
  rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

  // Separation line between headers and rows
  this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
    .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
    .lineWidth(2)
    .stroke();

  table.rows.forEach((row, i) => {
    const rowHeight = computeRowHeight(row);

    // Switch to next page if we cannot go any further because the space is over.
    // For safety, consider 3 rows margin instead of just one
    if (startY + 3 * rowHeight < maxY) startY = rowBottomY + rowSpacing;
    else this.addPage();

    // Allow the user to override style for rows
    prepareRow(row, i);

    // Print all cells of the current row
    row.forEach((cell, i) => {
      this.text(cell, startX + i * columnContainerWidth, startY, {
        width: columnWidth,
        align: "left"
      });
    });

    // Refresh the y coordinate of the bottom of this row
    rowBottomY = Math.max(startY + rowHeight, rowBottomY);

    // Separation line between rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(1)
      .opacity(0.7)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line
  });

  this.x = startX;
  this.moveDown();

  return this;
};

PDFDocument.prototype.addSVG = function(svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};

module.exports = PDFDocument;
