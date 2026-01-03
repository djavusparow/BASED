
import React from 'react';

export const LamboIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12.4V16c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export const WarpletLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M20 80 L40 20 L50 50 L60 20 L80 80 L65 80 L55 50 L45 80 Z" />
  </svg>
);

export const FarcasterLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24ZM18.2812 12C18.2812 8.53125 15.4688 5.71875 12 5.71875C8.53125 5.71875 5.71875 8.53125 5.71875 12C5.71875 15.4688 8.53125 18.2812 12 18.2812C15.4688 18.2812 18.2812 15.4688 18.2812 12ZM14.1562 12C14.1562 13.1875 13.1875 14.1562 12 14.1562C10.8125 14.1562 9.84375 13.1875 9.84375 12C9.84375 10.8125 10.8125 9.84375 12 9.84375C13.1875 9.84375 14.1562 10.8125 14.1562 12Z" />
  </svg>
);
