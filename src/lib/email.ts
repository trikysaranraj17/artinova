import { Order, OrderItem } from './db';

/**
 * Triggers a premium luxury HTML email via Resend (proxied through Next.js /api/email).
 * Supported emailTypes: 'placed' | 'verified' | 'rejected' | 'shipped' | 'delivered'
 */
export async function sendEmailTrigger(
  order: Order,
  items: OrderItem[],
  emailType: 'placed' | 'verified' | 'rejected' | 'shipped' | 'delivered',
  recipientEmail: string,
  extraData?: any
): Promise<boolean> {
  try {
    const payload = {
      orderId: order.id,
      emailType,
      recipientEmail,
      orderNumber: order.order_number,
      customerName: order.shipping_name || 'Bespoke Patron',
      items: items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization
      })),
      total: order.total,
      extraData
    };

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Email API returned non-ok response status:', response.status);
      return false;
    }

    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error('Failed to trigger email notification fetch request:', error);
    return false;
  }
}
