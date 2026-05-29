import { Order, OrderItem } from './db';

interface EmailPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: string;
  orderItems: string;
  hasPaymentScreenshot: string;
  _subject: string;
  _honey?: string;
}

/**
 * Dispatches completed order details to the shop owner via FormSubmit.co.
 * End destination: deepaksabari28@gmail.com
 */
export async function sendOrderEmailNotification(order: Order, items: OrderItem[]): Promise<boolean> {
  const endpoint = 'https://formsubmit.co/ajax/deepaksabari28@gmail.com';
  
  // Format items nicely for the email body
  const formattedItems = items
    .map(
      (item) =>
        `- ${item.product?.title || 'Custom Keepsake'} [Qty: ${item.quantity}] - $${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join('\n');

  const payload: EmailPayload = {
    orderId: order.id,
    customerName: order.shipping_name,
    customerPhone: order.shipping_phone,
    customerEmail: order.shipping_email,
    shippingAddress: order.shipping_address,
    totalAmount: `$${order.total_amount.toFixed(2)}`,
    orderItems: formattedItems,
    hasPaymentScreenshot: order.screenshot_url ? 'Yes, base64 receipt receipt uploaded (review in Admin Panel).' : 'No screenshot uploaded.',
    _subject: `[ARTINOVA] New Luxury Order Received - Ref: ${order.id.slice(0, 8)}`,
    _honey: '' // Honeypot spam blocker
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FormSubmit server rejected submission:', errorText);
      return false;
    }

    const jsonResult = await response.json();
    return jsonResult.success === 'true' || jsonResult.success === true;
  } catch (error) {
    console.error('Failed to dispatch FormSubmit email notification:', error);
    return false;
  }
}
