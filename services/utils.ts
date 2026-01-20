
import { Transaction, AppSettings, Formulation, Product } from '../types';

export const formatPKR = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const exportToCSV = (data: any[], fileName: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${val}"`).join(',')
  ).join('\n');
  
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printReport = (data: any, summary: any, range: string) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
    <html dir="rtl">
      <head>
        <title>Business Report - ${range}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 5px; }
          p.meta { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
          .cards { display: flex; gap: 10px; margin-bottom: 20px; justify-content: space-between; }
          .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
          .card h3 { margin: 5px 0 0; font-size: 18px; }
          .card span { font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #eee; padding: 8px; text-align: right; }
          th { background: #f9fafb; font-weight: bold; color: #444; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; }
        </style>
      </head>
      <body>
        <h1>Business Sales Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()} • Range: ${range}</p>
        
        <div class="cards">
            <div class="card">
                <span>Total Revenue</span>
                <h3 style="color: #2563eb">${formatPKR(summary.totalSales)}</h3>
            </div>
            <div class="card">
                <span>Total Cost</span>
                <h3 style="color: #d97706">${formatPKR(summary.totalCost)}</h3>
            </div>
            <div class="card">
                <span>Net Profit</span>
                <h3 style="color: ${summary.netProfit >= 0 ? '#16a34a' : '#dc2626'}">${formatPKR(summary.netProfit)}</h3>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Profit</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((t: any) => `
                    <tr>
                        <td>${t.InvoiceID}</td>
                        <td>${t.Date}</td>
                        <td>${t.Customer}</td>
                        <td>${t.Items}</td>
                        <td>${formatPKR(t.Revenue)}</td>
                        <td>${formatPKR(t.Profit)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">Orina Brand ERP System</div>
        <script>
            window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};

export const printFormulation = (formulation: Formulation, productName: string, ingredients: {name: string, qty: number, unit: string}[], settings: AppSettings) => {
    const printWindow = window.open('', '', 'width=800,height=1000');
    if (!printWindow) return;

    const logoHtml = settings.brandLogo 
    ? `<img src="${settings.brandLogo}" class="logo" alt="Logo" />` 
    : `<div class="logo-placeholder">${settings.brandName.charAt(0)}</div>`;

    const html = `
    <!DOCTYPE html>
    <html lang="en" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>Formulation - ${productName}</title>
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { height: 60px; margin-bottom: 10px; }
            .logo-placeholder { width: 60px; height: 60px; background: #333; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 10px auto; border-radius: 8px; }
            h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            h2 { font-size: 18px; margin-bottom: 10px; background: #f3f4f6; padding: 10px; border-radius: 6px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            .table th { background: #f9fafb; }
            .steps ol { padding-right: 20px; }
            .steps li { margin-bottom: 10px; line-height: 1.6; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px dashed #ccc; padding-top: 20px; }
            .warning { background: #fff7ed; color: #c2410c; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-bottom: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            ${logoHtml}
            <h1>${productName}</h1>
            <p style="color: #666; margin-top: 5px;">Master Formulation Card • ${settings.brandName}</p>
        </div>

        <div class="warning">
            CONFIDENTIAL: This document contains proprietary formulation data. Do not distribute.
        </div>

        <h2>Ingredients Required (اجزاء)</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity (Per Unit)</th>
                </tr>
            </thead>
            <tbody>
                ${ingredients.map(i => `
                    <tr>
                        <td><strong>${i.name}</strong></td>
                        <td>${i.qty}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>Step-by-Step Preparation (تیاری کا طریقہ)</h2>
        <div class="steps">
            ${formulation.instructions && formulation.instructions.length > 0 
                ? `<ol>${formulation.instructions.map(step => `<li>${step}</li>`).join('')}</ol>`
                : '<p style="text-align: center; color: #999;">No instructions recorded.</p>'
            }
        </div>

        <div class="footer">
            Generated on ${new Date().toLocaleDateString()} • Orina Brand ERP
        </div>
        <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};

export const printInvoice = (transaction: Transaction, settings: AppSettings) => {
  const printWindow = window.open('', '', 'width=794,height=1123'); // A4 Dimensions
  if (!printWindow) return;

  const logoHtml = settings.brandLogo 
    ? `<img src="${settings.brandLogo}" class="logo" alt="Logo" />` 
    : `<div class="logo-placeholder">${settings.brandName.charAt(0)}</div>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Invoice #${transaction.id}</title>
        <style>
            body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 40px;
                color: #1e293b;
                background: white;
                font-size: 14px;
            }
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
            }
            /* Header Section */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 50px;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 30px;
            }
            .company-info {
                flex: 1;
            }
            .logo {
                height: 80px;
                width: auto;
                object-fit: contain;
                margin-bottom: 15px;
            }
            .logo-placeholder {
                width: 80px;
                height: 80px;
                background: #0f172a;
                color: white;
                font-size: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                border-radius: 12px;
                margin-bottom: 15px;
            }
            .brand-name { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; }
            .brand-detail { color: #64748b; font-size: 13px; margin: 4px 0; max-width: 300px; line-height: 1.4; }
            
            .invoice-meta {
                text-align: right;
            }
            .invoice-title {
                font-size: 48px;
                font-weight: 900;
                color: #e2e8f0;
                text-transform: uppercase;
                letter-spacing: 4px;
                line-height: 0.8;
                margin-bottom: 20px;
            }
            .meta-table { margin-top: 15px; margin-left: auto; border-collapse: collapse; }
            .meta-table td { padding: 4px 0; padding-left: 20px; }
            .meta-label { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            .meta-value { font-weight: 700; color: #0f172a; font-size: 14px; }
            
            /* Bill To Section */
            .bill-section {
                margin-bottom: 40px;
                display: flex;
                justify-content: space-between;
                background: #f8fafc;
                padding: 25px;
                border-radius: 16px;
                border: 1px solid #e2e8f0;
            }
            .bill-to-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .customer-name { font-size: 20px; font-weight: 800; color: #0f172a; }
            
            /* Items Table */
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 40px;
            }
            .items-table th {
                background: #0f172a;
                color: white;
                text-align: left;
                padding: 16px 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .items-table td {
                padding: 16px 20px;
                border-bottom: 1px solid #e2e8f0;
                color: #334155;
                font-weight: 500;
            }
            .items-table tr:last-child td { border-bottom: 2px solid #0f172a; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            /* Totals Section */
            .totals-section {
                display: flex;
                justify-content: flex-end;
            }
            .totals-table {
                width: 350px;
                border-collapse: collapse;
            }
            .totals-table td { padding: 10px 0; }
            .totals-table .label { color: #64748b; font-weight: 600; }
            .totals-table .value { text-align: right; font-weight: 700; color: #0f172a; font-size: 16px; }
            .grand-total .label { color: #0f172a; font-size: 18px; font-weight: 900; }
            .grand-total .value { color: #2563eb; font-size: 24px; font-weight: 900; }
            
            /* Footer */
            .footer {
                margin-top: 80px;
                text-align: center;
                color: #94a3b8;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
                padding-top: 30px;
            }
            
            @media print {
                body { background: white; padding: 0; -webkit-print-color-adjust: exact; }
                .invoice-container { max-width: 100%; }
                .bill-section, .items-table th { -webkit-print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    ${logoHtml}
                    <h1 class="brand-name">${settings.brandName}</h1>
                    <div class="brand-detail">${settings.brandAddress ? settings.brandAddress.replace(/\n/g, '<br>') : ''}</div>
                    <div class="brand-detail">${settings.brandPhone ? '📞 ' + settings.brandPhone : ''}</div>
                </div>
                <div class="invoice-meta">
                    <div class="invoice-title">INVOICE</div>
                    <table class="meta-table">
                        <tr>
                            <td class="meta-label">Invoice ID</td>
                            <td class="meta-value">#${transaction.id}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Date Issued</td>
                            <td class="meta-value">${new Date(transaction.date).toLocaleDateString()}</td>
                        </tr>
                         <tr>
                            <td class="meta-label">Invoice Type</td>
                            <td class="meta-value" style="color: ${transaction.saleType === 'RETAIL' ? '#16a34a' : '#ea580c'}">${transaction.saleType}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Bill To -->
            <div class="bill-section">
                <div>
                    <div class="bill-to-title">Billed To Customer</div>
                    <div class="customer-name">${transaction.partyName}</div>
                </div>
                <div style="text-align: right">
                     <div class="bill-to-title">Payment Status</div>
                     <div style="font-weight: 800; color: ${transaction.status === 'PAID' ? '#16a34a' : '#ef4444'}; font-size: 16px;">
                        ${transaction.status}
                     </div>
                </div>
            </div>

            <!-- Items -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">Item Description</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Price</th>
                        <th class="text-right" style="border-top-right-radius: 8px; border-bottom-right-radius: 8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${transaction.items.map((item, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? 'white' : '#f8fafc'}">
                            <td>${item.name}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">${item.price.toLocaleString()}</td>
                            <td class="text-right">${(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td class="label">Sub Total</td>
                        <td class="value">${formatPKR(transaction.totalAmount)}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding-bottom: 20px; border-bottom: 2px dashed #e2e8f0;">Previous Balance</td>
                        <td class="value" style="padding-bottom: 20px; border-bottom: 2px dashed #e2e8f0;">${formatPKR(0)}</td>
                    </tr>
                    <tr class="grand-total">
                        <td class="label" style="padding-top: 20px;">Total Payable</td>
                        <td class="value" style="padding-top: 20px;">${formatPKR(transaction.totalAmount)}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding-top: 10px; color: #16a34a;">Amount Paid</td>
                        <td class="value" style="padding-top: 10px; color: #16a34a;">${formatPKR(transaction.paidAmount)}</td>
                    </tr>
                    <tr>
                        <td class="label" style="color: #ef4444;">Balance Due</td>
                        <td class="value" style="color: #ef4444;">${formatPKR(transaction.totalAmount - transaction.paidAmount)}</td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Thank you for doing business with ${settings.brandName}!</p>
                <p>For inquiries, please contact ${settings.brandPhone || 'us'}.</p>
                <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; width: 200px; margin-left: auto; margin-right: auto; padding-top: 10px;">Authorized Signature</div>
            </div>
        </div>
        <script>
            window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
        </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
