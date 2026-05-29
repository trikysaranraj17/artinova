import { getProductById } from '../../../lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }
  
  return <ProductClient product={product} />;
}
