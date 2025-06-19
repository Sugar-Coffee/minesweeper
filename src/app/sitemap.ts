import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://minesweeper.sugarandcoffee.co.uk'

  return [
    {
      url: baseUrl,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
} 