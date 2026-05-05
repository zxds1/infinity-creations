export type SocialLinkId = 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'x' | 'linkedin';

export interface SocialLink {
  id: SocialLinkId;
  label: string;
  href: string;
  brandColor: string;
}

export const defaultSocialLinks: SocialLink[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: 'https://wa.me/254700000000',
    brandColor: '#25D366'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/maridadicreations/',
    brandColor: '#E4405F'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/maridadicreations',
    brandColor: '#1877F2'
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@maridadicreations',
    brandColor: '#111111'
  },
  {
    id: 'x',
    label: 'X',
    href: 'https://x.com/maridadicreations',
    brandColor: '#111111'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/maridadi-creations',
    brandColor: '#0A66C2'
  }
];

export const socialLinks = defaultSocialLinks;

export function normalizeSocialLinks(links?: Partial<SocialLink>[] | null): SocialLink[] {
  if (!Array.isArray(links)) return defaultSocialLinks;
  if (links.length === 0) return [];

  return links.map((link, index) => {
    const fallback = defaultSocialLinks[index % defaultSocialLinks.length];
    return {
      id: (link.id || fallback.id) as SocialLinkId,
      label: link.label || fallback.label,
      href: link.href || '',
      brandColor: link.brandColor || fallback.brandColor
    };
  });
}
