import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderId, emailType, recipientEmail, orderNumber, customerName, items, total, extraData } = await req.json();

    const apiKey = process.env.RESEND_API_KEY || '';
    
    // Build Luxury HTML Template
    let subject = '';
    let previewText = '';
    let mainHeading = '';
    let messageBody = '';

    const formattedTotal = typeof total === 'number' ? `₹${total.toLocaleString()}` : total;

    // Build items table rows
    let itemsHtml = '';
    if (Array.isArray(items) && items.length > 0) {
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'DM Sans', sans-serif; color: #F5F0E8;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C9A84C;">
              <th style="padding: 10px 0;">Item</th>
              <th style="padding: 10px 0; text-align: center;">Qty</th>
              <th style="padding: 10px 0; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
      `;
      items.forEach((item: any) => {
        const itemPrice = typeof item.price === 'number' ? `₹${item.price.toLocaleString()}` : item.price;
        const customizationInfo = item.customization?.engravingText 
          ? `<br/><span style="font-size: 10px; color: #9A8F7E; font-style: italic;">Engraving: "${item.customization.engravingText}"</span>` 
          : '';
        itemsHtml += `
          <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px;">
            <td style="padding: 12px 0; font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: bold;">
              ${item.product_name || item.product?.name || 'Luxury Creation'}
              ${customizationInfo}
            </td>
            <td style="padding: 12px 0; text-align: center; color: #9A8F7E;">${item.quantity}</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #C9A84C;">${itemPrice}</td>
          </tr>
        `;
      });
      itemsHtml += `
          </tbody>
        </table>
      `;
    }

    switch (emailType) {
      case 'placed':
        subject = `Order #${orderNumber} Confirmed — Artinova`;
        previewText = 'Greetings from Artinova! Your custom gift booking is confirmed.';
        mainHeading = 'ORDER CONFIRMED';
        messageBody = `
          <p style="margin-top: 0; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
          <p style="font-size: 15px; line-height: 1.6;">Greetings from <strong>ARTINOVA</strong>! We are absolutely delighted to confirm that your order <strong>#${orderNumber}</strong> has been successfully placed.</p>
          <p style="font-size: 15px; line-height: 1.6;">Your GPay/UPI manual payment screenshot has been uploaded. Our curation team will verify the payment and get in touch with you soon via email or WhatsApp to finalize your design specifications, text engravings, and delivery logistics.</p>
          <div style="background-color: rgba(201, 168, 76, 0.08); border: 1px dashed #C9A84C; padding: 15px; margin: 25px 0; border-radius: 4px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; font-family: 'Cinzel', sans-serif; color: #C9A84C; letter-spacing: 1px; font-size: 12px;">Payment Verification in Progress</h4>
            <p style="margin: 0; font-size: 13px; color: #9A8F7E; line-height: 1.5;">Our curation team reviews GPay screenshots within the next 2 hours. Once verified, we will trigger your order crafting schedule and reach out to you.</p>
          </div>
          ${itemsHtml}
        `;
        break;

      case 'verified':
        subject = `Payment Verified ✓ — Artinova Order #${orderNumber}`;
        previewText = 'Greetings from Artinova! Your transaction has been verified successfully.';
        mainHeading = 'PAYMENT VERIFIED';
        messageBody = `
          <p style="margin-top: 0; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
          <p style="font-size: 15px; line-height: 1.6;">Greetings from <strong>ARTINOVA</strong>! We are pleased to inform you that your GPay/UPI manual transaction screenshot has been verified and confirmed.</p>
          <p style="font-size: 15px; line-height: 1.6;">Your order is officially approved for crafting. Our curation team will get in touch with you soon to double-check any customization specifications before pouring and handcrafting begin.</p>
          
          <div style="margin: 25px 0; padding-left: 20px; border-left: 2px solid #C9A84C; font-family: 'DM Sans', sans-serif;">
            <h4 style="margin: 0 0 10px 0; font-family: 'Cinzel', sans-serif; color: #C9A84C; font-size: 11px; letter-spacing: 1px;">Crafting Timeline & QC</h4>
            <ul style="margin: 0; padding: 0 0 0 15px; font-size: 13px; color: #9A8F7E; line-height: 1.8;">
              <li>Design Customization Confirmed</li>
              <li>Handcrafting & Pouring (3-4 Business Days)</li>
              <li>Double-pass Quality Control Check</li>
              <li>Signature Ribbon Gift-Wrapping & Wax Stamped Seal</li>
            </ul>
          </div>
          <p style="font-size: 13px; color: #9A8F7E;">Estimated crafting and dispatch window: 5–7 business days.</p>
        `;
        break;

      case 'rejected':
        subject = `Payment Issue — Action Required`;
        previewText = 'Payment screenshot validation failed. Action is required to process order.';
        mainHeading = 'PAYMENT SUSPENDED';
        const rejectReason = extraData?.reason || 'The transaction screenshot was unclear or could not be matched with our accounts registry.';
        messageBody = `
          <p style="margin-top: 0; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
          <p style="font-size: 15px; line-height: 1.6; color: #e11d48;">We encountered an issue while verifying your manual payment receipt for Order #${orderNumber}.</p>
          <div style="background-color: rgba(225, 29, 72, 0.06); border: 1px solid rgba(225, 29, 72, 0.2); padding: 15px; margin: 20px 0; border-radius: 4px; color: #F5F0E8;">
            <strong style="font-size: 12px; text-transform: uppercase; color: #e11d48;">Reason for Suspension:</strong>
            <p style="margin: 5px 0 0 0; font-size: 13px; line-height: 1.5; color: #9A8F7E;">${rejectReason}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6;"><strong>Action Required:</strong> Please log into your <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile" style="color: #C9A84C; text-decoration: underline;">Artinova Profile</a> and re-upload the correct GPay/UPI confirmation screenshot, or connect with our support line at akashselva18@gmail.com.</p>
        `;
        break;

      case 'shipped':
        subject = `Your Artinova Gift is On Its Way 🚀`;
        previewText = 'Exciting news! Your custom package is in transit.';
        mainHeading = 'CREATION SHIPPED';
        const trackingNum = extraData?.trackingNumber || 'TRANSIT-PENDING';
        const courierName = extraData?.courier || 'Luxury Courier Services';
        messageBody = `
          <p style="margin-top: 0; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
          <p style="font-size: 15px; line-height: 1.6;">Your bespoke order has passed all master-craftsman checks and has been packaged in our signature luxury presentation box. It is now in route to your delivery address.</p>
          <div style="background-color: #161616; border: 1px solid rgba(201, 168, 76, 0.1); padding: 20px; margin: 25px 0; border-radius: 4px; font-family: 'DM Sans', sans-serif;">
            <table style="width: 100%; font-size: 13px; color: #F5F0E8;">
              <tr>
                <td style="padding-bottom: 8px; color: #9A8F7E; width: 120px;">Courier Partner:</td>
                <td style="padding-bottom: 8px; font-weight: bold;">${courierName}</td>
              </tr>
              <tr>
                <td style="color: #9A8F7E;">AWB Tracking:</td>
                <td><strong style="color: #C9A84C;">${trackingNum}</strong></td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px;">You can track real-time logistics logs directly on your dashboard.</p>
        `;
        break;

      case 'delivered':
        subject = `Delivered! We hope they loved it 💛`;
        previewText = 'Your signature Artinova package has been delivered.';
        mainHeading = 'DELIVERY CONFIRMED';
        messageBody = `
          <p style="margin-top: 0; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
          <p style="font-size: 15px; line-height: 1.6;">Our tracking logs confirm that your luxury order <strong>#${orderNumber}</strong> has been successfully delivered.</p>
          <p style="font-size: 15px; line-height: 1.6;">We hope this handcrafted creation brings happiness and celebrates your meaningful milestones beautifully.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products" style="background-color: #C9A84C; color: #0A0A0A; text-decoration: none; padding: 12px 30px; font-family: 'Cinzel', sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 2px; border-radius: 2px; display: inline-block;">Leave a Studio Review</a>
          </div>
        `;
        break;

      default:
        subject = `Order Status Update — Artinova`;
        mainHeading = 'ORDER UPDATE';
        messageBody = `<p style="font-size: 15px; line-height: 1.6;">Your order status has been updated. Please log into your portal to view details.</p>`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="background-color: #0A0A0A; color: #F5F0E8; font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid rgba(201, 168, 76, 0.15); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);">
            
            <!-- Luxury Branding Header -->
            <div style="background-color: #0A0A0A; border-bottom: 1px solid rgba(201, 168, 76, 0.1); padding: 35px 20px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 300; letter-spacing: 6px; color: #C9A84C;">
                ARTINOVA
              </h1>
              <p style="margin: 8px 0 0 0; font-family: 'Cinzel', Trajan, serif; font-size: 9px; letter-spacing: 3px; color: #9A8F7E;">
                CRAFTING EMOTIONS INTO LUXURY GIFTS
              </p>
            </div>

            <!-- Content Area -->
            <div style="padding: 30px 20px; font-family: 'DM Sans', sans-serif;">
              <h2 style="margin: 0 0 20px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #C9A84C; border-bottom: 1px solid rgba(201, 168, 76, 0.1); padding-bottom: 15px;">
                ${mainHeading}
              </h2>
              
              ${messageBody}

              <!-- Pricing breakdown summary -->
              ${formattedTotal ? `
                <div style="margin-top: 30px; border-top: 1px solid rgba(201, 168, 76, 0.1); pt: 15px; text-align: right;">
                  <span style="font-family: 'Cinzel', sans-serif; font-size: 11px; color: #9A8F7E; letter-spacing: 1px;">TOTAL:</span>
                  <span style="font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #C9A84C; font-weight: bold; margin-left: 10px;">${formattedTotal}</span>
                </div>
              ` : ''}
            </div>

            <!-- Studio Footer -->
            <div style="background-color: #080808; border-top: 1px solid rgba(201, 168, 76, 0.05); padding: 30px 20px; text-align: center; font-size: 11px; color: #9A8F7E; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-family: 'Cinzel', sans-serif; letter-spacing: 1px; color: #C9A84C;">ARTINOVA GIFTING STUDIO</p>
              <p style="margin: 0;">Chennai, Tamil Nadu, India &bull; akashselva18@gmail.com</p>
              <p style="margin: 15px 0 0 0; font-size: 10px; color: rgba(154, 143, 126, 0.4);">&copy; 2026 ARTINOVA. All rights reserved.</p>
            </div>
            
          </div>
        </body>
      </html>
    `;

    if (apiKey) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: 'ARTINOVA <akashselva18@gmail.com>',
          to: recipientEmail,
          subject: subject,
          html: htmlContent
        })
      });

      if (resendResponse.ok) {
        return NextResponse.json({ success: true, message: 'Email sent successfully via Resend' });
      } else {
        const errData = await resendResponse.json();
        console.error('Resend API returned error:', errData);
        return NextResponse.json({ success: false, error: errData }, { status: 500 });
      }
    } else {
      // Graceful local logging fallback
      console.log('============= [MOCK LUXURY EMAIL DISPATCH] =============');
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview: ${previewText}`);
      console.log(`Content length: ${htmlContent.length} bytes`);
      console.log('========================================================');
      return NextResponse.json({ success: true, message: 'Logged mock luxury email successfully (No API key found)' });
    }
  } catch (error: any) {
    console.error('Error in send email API route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
