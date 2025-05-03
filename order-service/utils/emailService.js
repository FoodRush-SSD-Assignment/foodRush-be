const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOrderConfirmation = async (to, name, orderId, items, totalAmount) => {
    const itemsHtml = items.map(item => `
      <li>${item.name} - Qty: ${item.quantity}, Price: LKR ${item.price}</li>
    `).join("");
  
    const itemsText = items.map(item => 
      `- ${item.name} x${item.quantity} (LKR ${item.price})`
    ).join("\n");
  
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Order Confirmation",
        text: `
            Hello ${name},
            
            Thank you for your order! Here are the details:
            
            Order ID: ${orderId}
            
            Items Ordered:
            ${itemsText}
            
            Total Amount: LKR ${totalAmount}.00
            
            We hope you enjoy your meal!
            
            - Your Food Order System
        `,
        html: `
            <h2>Hello ${name},</h2>
            <p>Thank you for your order! Here are the details:</p>
    
            <p><strong>Order ID:</strong> ${orderId}</p>
    
            <h3>Items Ordered:</h3>
            <ul>${itemsHtml}</ul>
    
            <p><strong>Total Amount:</strong> <strong>LKR ${totalAmount}.00</strong></p>
    
            <p>We hope you enjoy your meal!</p>
            <hr style="border: none; border-top: 1px solid #c83c3c;" />
            <p style="font-size: 12px; color: #777;">This is an automated email from Foodrush customer service.</p>
        `,
    };
  
    await transporter.sendMail(mailOptions);
};