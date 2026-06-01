import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  variant?: 'row' | 'column';
}

export default function SocialShare({
  title = 'KetoPlanner — AI-Powered Keto Diet Calculator & Meal Planner',
  description = 'Get your personalized keto macro calculations and AI-generated 7-day meal plan.',
  url = 'https://ketoai.app/',
  variant = 'row',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareLinks = [
    {
      name: 'Twitter / X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:text-black',
      bg: 'hover:bg-gray-100',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: 'hover:text-blue-600',
      bg: 'hover:bg-blue-50',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-blue-700',
      bg: 'hover:bg-blue-50',
    },
    {
      name: 'WhatsApp',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`,
      color: 'hover:text-green-600',
      bg: 'hover:bg-green-50',
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className={`flex ${variant === 'column' ? 'flex-col' : 'flex-row flex-wrap'} items-center gap-2`}>
      <span className="text-sm text-gray-500 flex items-center gap-1 mr-1">
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share:</span>
      </span>
      {shareLinks.map((share) => {
        const Icon = share.icon;
        return (
          <a
            key={share.name}
            href={share.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${share.name}`}
            className={`p-2 rounded-full transition-colors ${share.bg} ${share.color}`}
          >
            <Icon className="h-5 w-5 text-gray-500 group-hover:text-current" />
          </a>
        );
      })}
      <button
        onClick={copyLink}
        title="Copy link"
        className="p-2 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        {copied ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <LinkIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  );
}
