import { getOrderById, getOrderItems, getTrackingUpdates } from '../../../lib/db';
import TrackingClient from './TrackingClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function Page({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const items = await getOrderItems(orderId);
  const updates = await getTrackingUpdates(orderId);

  return <TrackingClient order={order} items={items} initialUpdates={updates} />;
}
