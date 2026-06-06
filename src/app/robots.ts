import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-secure-dashboard', '/admin-secure-dashboard/'],
    },
    sitemap: 'https://artinova.vercel.app/sitemap.xml',
  };
}
