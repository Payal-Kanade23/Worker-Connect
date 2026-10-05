import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { findUserByCustomerId, findUserByWorkerId, getCustomerId, getServiceByBookedId } from "../models/User.js";
import { findBookRequestByBId } from "../models/Book.js";
import { checkInvoice, createInvoice, findInvoice } from "../models/Invoice.js";

// ---------- Design constants ----------
const COLORS = {
  primary: "#1F2937",   // dark slate (headers, main text)
  accent: "#2563EB",    // blue accent
  muted: "#6B7280",     // gray for secondary text
  border: "#E5E7EB",    // light border
  tableHeaderBg: "#F3F4F6",
  rowAltBg: "#FAFAFA",
  white: "#FFFFFF",
};

const PAGE_MARGIN = 50;

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.invoiceId as string;
    const { c_id, w_id, b_id } = req.query;

    if (
      typeof c_id !== "string" ||
      typeof w_id !== "string" ||
      typeof b_id !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid invoice parameters",
      });
    }

    const result = await findInvoice(invoiceId);
    if (!result) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const customer = await findUserByCustomerId(c_id);
    const worker = await findUserByWorkerId(w_id);
    const book_request = await findBookRequestByBId(b_id);
    const book_services = await getServiceByBookedId(b_id);

    const itemslist = book_services.map((service: any) => ({
      name: service.name,
      price: service.price ?? null, // include if available, else null
    }));

    const invoice = {
      invoiceNumber: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customer.name,
      customerEmail: customer.email,
      workerName: worker.name,
      workerEmail: worker.email,
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      bookingDate: new Date(book_request.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      price: book_request.total_amount,
      items: itemslist,
    };

    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoiceNumber}.pdf"`
    );

    doc.pipe(res);

    renderHeader(doc, invoice, b_id);
    renderPartyDetails(doc, invoice);
    renderItemsTable(doc, invoice);
    renderTotal(doc, invoice);
    renderFooter(doc);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate invoice",
    });
  }
};

// ---------- Section renderers ----------

function renderHeader(doc: PDFKit.PDFDocument, invoice: any, b_id: string) {
  const { width } = doc.page;
  const contentWidth = width - PAGE_MARGIN * 2;

  // Company / brand block (left)
  doc
    .fillColor(COLORS.primary)
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("WeeConnect", PAGE_MARGIN, PAGE_MARGIN);

  doc
    .fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text("123 Business Street, Surat, Gujarat, India", PAGE_MARGIN, PAGE_MARGIN + 26)
    .text("weeconnect@gmail.com  |  +91 4512894758", PAGE_MARGIN, PAGE_MARGIN + 40);

  // INVOICE title + meta (right)
  doc
    .fillColor(COLORS.accent)
    .fontSize(26)
    .font("Helvetica-Bold")
    .text("INVOICE", PAGE_MARGIN, PAGE_MARGIN, {
      width: contentWidth,
      align: "right",
    });

  doc
    .fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text(`Invoice No:  ${invoice.invoiceNumber}`, PAGE_MARGIN, PAGE_MARGIN + 30, {
      width: contentWidth,
      align: "right",
    })
    .text(`Booking ID:  ${b_id}`, {
      width: contentWidth,
      align: "right",
    })
    .text(`Date:  ${invoice.date}`, {
      width: contentWidth,
      align: "right",
    });

  // Divider line
  const dividerY = PAGE_MARGIN + 70;
  doc
    .moveTo(PAGE_MARGIN, dividerY)
    .lineTo(width - PAGE_MARGIN, dividerY)
    .lineWidth(1.5)
    .strokeColor(COLORS.accent)
    .stroke();

  doc.y = dividerY + 20;
}

function renderPartyDetails(doc: PDFKit.PDFDocument, invoice: any) {
  const { width } = doc.page;
  const contentWidth = width - PAGE_MARGIN * 2;
  const colWidth = contentWidth / 2 - 10;
  const startY = doc.y;

  // Billed To (customer)
  doc
    .fillColor(COLORS.muted)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("BILLED TO", PAGE_MARGIN, startY);

  doc
    .fillColor(COLORS.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(invoice.customerName, PAGE_MARGIN, startY + 16);

  doc
    .fillColor(COLORS.muted)
    .fontSize(10)
    .font("Helvetica")
    .text(invoice.customerEmail, PAGE_MARGIN, startY + 34);

  // Service Provider (worker)
  const rightX = PAGE_MARGIN + colWidth + 20;

  doc
    .fillColor(COLORS.muted)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("SERVICE PROVIDER", rightX, startY, { width: colWidth });

  doc
    .fillColor(COLORS.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(invoice.workerName, rightX, startY + 16, { width: colWidth });

  doc
    .fillColor(COLORS.muted)
    .fontSize(10)
    .font("Helvetica")
    .text(invoice.workerEmail, rightX, startY + 34, { width: colWidth })
    .text(`Booking Date: ${invoice.bookingDate}`, rightX, startY + 50, {
      width: colWidth,
    });

  doc.y = startY + 80;
  doc.moveDown();
}

function renderItemsTable(doc: PDFKit.PDFDocument, invoice: any) {
  const { width } = doc.page;
  const tableX = PAGE_MARGIN;
  const tableWidth = width - PAGE_MARGIN * 2;
  const colSrNo = 40;
  const colPrice = 100;
  const colName = tableWidth - colSrNo - colPrice;
  const rowHeight = 26;

  let y = doc.y;

  // Table header
  doc.rect(tableX, y, tableWidth, rowHeight).fill(COLORS.tableHeaderBg);

  doc
    .fillColor(COLORS.primary)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("#", tableX + 10, y + 8, { width: colSrNo })
    .text("SERVICE DESCRIPTION", tableX + colSrNo, y + 8, { width: colName })
    .text("AMOUNT", tableX + colSrNo + colName, y + 8, {
      width: colPrice - 10,
      align: "right",
    });

  y += rowHeight;

  // Table rows
  invoice.items.forEach((item: any, idx: number) => {
    const rowY = y;

    if (idx % 2 === 1) {
      doc.rect(tableX, rowY, tableWidth, rowHeight).fill(COLORS.rowAltBg);
    }

    doc
      .fillColor(COLORS.primary)
      .fontSize(10)
      .font("Helvetica")
      .text(String(idx + 1), tableX + 10, rowY + 8, { width: colSrNo })
      .text(item.name, tableX + colSrNo, rowY + 8, { width: colName })
      .text(
        item.price != null ? `Rs. ${item.price}` : "-",
        tableX + colSrNo + colName,
        rowY + 8,
        { width: colPrice - 10, align: "right" }
      );

    y += rowHeight;
  });

  // Bottom border of table
  doc
    .moveTo(tableX, y)
    .lineTo(tableX + tableWidth, y)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();

  doc.y = y + 20;
}

function renderTotal(doc: PDFKit.PDFDocument, invoice: any) {
  const { width } = doc.page;
  const boxWidth = 220;
  const boxX = width - PAGE_MARGIN - boxWidth;
  const y = doc.y;

  doc.rect(boxX, y, boxWidth, 40).fill(COLORS.primary);

  doc
    .fillColor(COLORS.white)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("TOTAL AMOUNT", boxX + 15, y + 10);

  doc
    .fillColor(COLORS.white)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`Rs. ${invoice.price}`, boxX, y + 10, {
      width: boxWidth - 15,
      align: "right",
    });

  doc.y = y + 60;
}

function renderFooter(doc: PDFKit.PDFDocument) {
  const { width, height } = doc.page;
  const footerY = height - PAGE_MARGIN - 40;

  doc
    .moveTo(PAGE_MARGIN, footerY)
    .lineTo(width - PAGE_MARGIN, footerY)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text("Thank you for your business!", PAGE_MARGIN, footerY + 10, {
      width: width - PAGE_MARGIN * 2,
      align: "center",
    })
    .text("This is a computer-generated invoice and does not require a signature.", {
      width: width - PAGE_MARGIN * 2,
      align: "center",
    });
}