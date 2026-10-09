import React, { useRef } from "react";
import { Button } from "antd";
import html2pdf from "html2pdf.js";
import Logo from "../components/Logo";
import "../page_style/invoiceReceipt.css";

const InvoiceReceipt = ({ invoiceData, onClose }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = receiptRef.current;

    const opt = {
      margin: 0,
      filename: `${invoiceData.invoiceNo || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        height: 1122, // A4 height in px
        windowHeight: 1122,
      },
      jsPDF: {
        unit: "px",
        format: [793, 1122], // A4 size at 96dpi
        orientation: "portrait",
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!invoiceData) return <p>Loading...</p>;

  return (
    <div className="receipt-page">
      <div className="print-hide button-bar">
        <Button onClick={handlePrint} type="primary">🖨️ Print</Button>
        <Button onClick={handleDownloadPDF}>⬇️ PDF</Button>
        <Button onClick={onClose} danger>Close</Button>
      </div>

      <div ref={receiptRef} className="invoice-wrapper">
        {/* Header */}
        <div className="invoice-header">
          <Logo size={100} />
          <p>Infront of Attar Hospital, Kharkhana Road, Takli Sikandhar</p>
          <p>Mohol, Maharashtra - 413248</p>
          <p>📞 9960145979 / 9960910070 | ✉️ prasadgaikwad202000@gmail.com</p>
        </div>

        <hr />

        <h3 className="receipt-title">🧾 Invoice Receipt</h3>

        {/* Customer Info */}
        <div className="invoice-details">
          <p><strong>Invoice No:</strong> {invoiceData.invoiceNo || "N/A"}</p>
          <p><strong>Date:</strong> {invoiceData.invoiceDate || "N/A"}</p>
          <p><strong>Customer Name:</strong> {invoiceData.customerName || "N/A"}</p>
          <p><strong>Mobile Number:</strong> {invoiceData.mobile_no || "N/A"}</p>
          <p><strong>Shipping Address:</strong> {invoiceData.shippingAddress || "N/A"}</p>
        </div>

        {/* Products */}
        <div className="table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc %</th>
                <th>Tax %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.products?.length > 0 ? (
                invoiceData.products.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice}</td>
                    <td>{item.discount}%</td>
                    <td>{item.taxPercentage || 0}%</td>
                    <td>₹{item.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No products available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="invoice-totals">
          <p><strong>Total:</strong> ₹{invoiceData.totalAmount?.toFixed(2) || "0.00"}</p>
          <p><strong>Discount:</strong> ₹{invoiceData.totalDiscount?.toFixed(2) || "0.00"}</p>
          <p><strong>Tax:</strong> ₹{invoiceData.totalTax?.toFixed(2) || "0.00"}</p>
          <p><strong>Payable:</strong> ₹{invoiceData.totalPayable?.toFixed(2) || "0.00"}</p>
          <p><strong>Paid:</strong> ₹{invoiceData.paidAmount?.toFixed(2) || "0.00"}</p>
          <p><strong>Due:</strong> ₹{invoiceData.dueAmount?.toFixed(2) || "0.00"}</p>
          <p><strong>Status:</strong> {invoiceData.status || "N/A"}</p>
          <p><strong>Payment Mode:</strong> {invoiceData.paymentMode || "N/A"}</p>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p><em>Thank You, Visit Again! 😊🙏</em></p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReceipt;
