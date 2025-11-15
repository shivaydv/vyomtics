// Email template for user when order is placed
export const orderPlacedUser = (orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
}) => {
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(
          2
        )}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `Order Confirmation - Order #${orderDetails.orderId}`,
    text: `Dear ${orderDetails.customerName},

Thank you for your order! Your order #${
      orderDetails.orderId
    } has been successfully placed.

Order Details:
${orderDetails.items
  .map(
    (item) =>
      `- ${item.name} x ${item.quantity} = ₹${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}
Shipping Address: ${orderDetails.shippingAddress}

We'll send you tracking information once your order ships.

Best regards,
Karnika Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Order Confirmation</h1>
          <p style="color: #7f8c8d; font-size: 16px;">Thank you for your order!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${
            orderDetails.customerName
          },</h2>
          <p>Your order <strong>#${
            orderDetails.orderId
          }</strong> has been successfully placed and is being processed.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #3498db; color: white;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right;">Total Amount:</td>
                <td style="padding: 12px; text-align: right; color: #e74c3c;">₹${orderDetails.totalAmount.toFixed(
                  2
                )}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h4 style="color: #27ae60; margin-top: 0;">Shipping Information</h4>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${
            orderDetails.shippingAddress
          }</p>
          
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d;">We'll send you tracking information once your order ships.</p>
          <p style="color: #2c3e50; font-weight: bold;">Thank you for choosing Karnika!</p>
        </div>
      </div>
    `,
  };
};

// Email template for admin when new order is placed
export const orderPlacedAdmin = (orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  orderDate: string;
}) => {
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(
          2
        )}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `🔔 New Order Received - Order #${orderDetails.orderId}`,
    text: `New Order Alert!

Order ID: ${orderDetails.orderId}
Order Date: ${orderDetails.orderDate}

Customer Information:
Name: ${orderDetails.customerName}
Email: ${orderDetails.customerEmail}
Phone: ${orderDetails.customerPhone}

Order Items:
${orderDetails.items
  .map(
    (item) =>
      `- ${item.name} x ${item.quantity} = ₹${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}
Payment Method: ${orderDetails.paymentMethod}
Shipping Address: ${orderDetails.shippingAddress}

Please process this order promptly.

Karnika Admin System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; background-color: #e74c3c; color: white; padding: 20px; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 24px;">🔔 New Order Alert!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Order #${
            orderDetails.orderId
          }</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-top: 0;">⚡ Action Required</h3>
          <p style="color: #856404; margin-bottom: 0;">A new order has been placed and requires processing.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">Customer Information</h3>
          <table style="width: 100%; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 8px;">${orderDetails.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${
                orderDetails.customerEmail
              }">${orderDetails.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Phone:</td>
              <td style="padding: 8px;"><a href="tel:${
                orderDetails.customerPhone
              }">${orderDetails.customerPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Order Date:</td>
              <td style="padding: 8px;">${orderDetails.orderDate}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #e74c3c; color: white;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right;">Total Amount:</td>
                <td style="padding: 12px; text-align: right; color: #e74c3c; font-size: 18px;">₹${orderDetails.totalAmount.toFixed(
                  2
                )}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">Shipping & Payment</h3>
          <table style="width: 100%; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 30%;">Payment Method:</td>
              <td style="padding: 8px;">${orderDetails.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; vertical-align: top;">Shipping Address:</td>
              <td style="padding: 8px;">${orderDetails.shippingAddress}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <p style="color: #2c3e50; font-weight: bold; margin: 0;">Please process this order promptly!</p>
          <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 14px;">Karnika Admin System</p>
        </div>
      </div>
    `,
  };
};

export const ResetPasswordEmailTemplate = ({ link }: { link: URL }) => {
  return {
    subject: "Reset your password - Karnika",
    text: `Click the link to reset your password: ${link}`,
    html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6;">
              You requested to reset your password for your Karnika account. Click the button below to reset your password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
              <br>
              <a href="${link}" style="color: #ff6b35;">${link}</a>
            </p>
          </div>
        `,
  };
};
