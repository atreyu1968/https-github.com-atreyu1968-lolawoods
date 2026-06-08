export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  synopsis: string;
  genre: string;
  isbn?: string;
  pages?: number;
  publisher?: string;
  publishDate?: string;
  coverImage: string; // Base64 or URL
  buyLinks: {
    amazon?: string;
    kobo?: string;
    editorial?: string;
    other?: string;
  };
  isFeatured?: boolean;
  rating?: number;
  reviews?: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export interface AuthorEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  ticketUrl?: string;
  eventType: 'sign' | 'fair' | 'talk' | 'other';
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface NewsletterEmail {
  id: string;
  email: string;
  date: string;
}

export interface SiteConfig {
  authorName: string;
  authorPseudonym: string;
  tagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  bioHeadline: string;
  bioText1: string;
  bioText2: string;
  quote: string;
  quoteSource: string;
  profileImage: string;
  agentName: string;
  agentContact: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialGoodreads?: string;
  themeColor: 'gold' | 'emerald' | 'rose' | 'amber' | 'slate' | 'patio';
  adminPasscode: string;
  footerRights?: string;
  genres?: string[];
}
