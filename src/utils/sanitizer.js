import sanitizeHtml from 'sanitize-html';
import { R2_PUBLIC_URL } from '../config/storage.js';

/**
 * Sanitizes an HTML string to prevent XSS while allowing specific tags and attributes.
 * Specially configured for the Tiptap Rich Text Editor.
 * @param {string} dirty HTML string to sanitize
 * @returns {string} Sanitized HTML string
 */
export const sanitizeArticleContent = (dirty) => {
  if (!dirty) return '';

  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img'
    ],
    allowedAttributes: {
      '*': ['class', 'style'],
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/]
      }
    },
    allowProtocolRelative: false,
    allowedSchemesByTag: {
      img: ['http', 'https'],
      a: ['http', 'https', 'mailto', 'tel']
    },
    transformTags: {
      'img': (tagName, attribs) => {
        const src = attribs.src || '';
        let isValid = false;

        if (src.startsWith('/api/v1/images/')) {
          isValid = true;
        } else if (R2_PUBLIC_URL) {
          const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
          if (src.startsWith(baseUrl)) {
            isValid = true;
          }
        }

        if (isValid) {
          return {
            tagName: 'img',
            attribs: {
              src: src,
              alt: attribs.alt || '',
              title: attribs.title || ''
            }
          };
        }
        
        // Discard img if it doesn't match our secure storage endpoints
        return {
          tagName: 'span',
          text: '[Invalid Image Removed]'
        };
      }
    },
    enforceHtmlBoundary: true
  });
};
