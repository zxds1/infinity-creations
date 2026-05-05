import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import type { SocialLinkId } from '../lib/socialLinks';

interface SocialIconProps {
  id: SocialLinkId;
  size?: number;
  className?: string;
}

export default function SocialIcon({ id, size = 18, className }: SocialIconProps) {
  if (id === 'whatsapp') return <MessageCircle size={size} className={className} />;
  if (id === 'instagram') return <Instagram size={size} className={className} />;
  if (id === 'facebook') return <Facebook size={size} className={className} />;
  if (id === 'linkedin') return <Linkedin size={size} className={className} />;

  if (id === 'x') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path fill="currentColor" d="M18.9 2h3.2l-7 8 8.2 12h-6.4l-5-7.3L6.2 22H2.9l7.5-8.6L2.5 2h6.6l4.5 6.5L18.9 2Zm-1.1 17.9h1.8L8.1 4H6.2l11.6 15.9Z" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#25F4EE" d="M11.1 2h3.4c.3 2.4 1.7 3.8 4 4v3.4a8.2 8.2 0 0 1-4-.9v6.9c0 3.6-2.5 6.1-6 6.1-3 0-5.4-2-5.9-4.9-.5-3.2 1.8-6.2 5-6.7.6-.1 1.2-.1 1.8 0v3.5c-.4-.1-.8-.1-1.2 0-1.3.2-2.2 1.4-2 2.7.2 1.2 1.2 2 2.4 2 1.5 0 2.5-1 2.5-2.8V2Z" />
      <path fill="#FE2C55" d="M13.2 2h1.3c.3 2.4 1.7 3.8 4 4v1.3c-2.2-.5-4.5-2.1-5.3-5.3Zm-3.8 8v3.5c-.4-.1-.8-.1-1.2 0-1.3.2-2.2 1.4-2 2.7.1.8.6 1.4 1.3 1.8-1.8-.3-3.1-1.7-3.1-3.4 0-2.3 2.3-4.8 5-4.6Z" />
      <path fill="currentColor" d="M11.1 2h2.1c.8 3.2 3.1 4.8 5.3 5.3v2.1a8.2 8.2 0 0 1-4-.9v6.9c0 3.6-2.5 6.1-6 6.1-2 0-3.8-.9-4.8-2.4 1 .7 2.2 1.1 3.5 1.1 3.5 0 6-2.5 6-6.1V7.2c1.2.6 2.4.9 3.7 1V7.1c-2.5-.7-4.4-2.5-4.8-5.1h-1Z" />
    </svg>
  );
}
