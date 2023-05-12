import { generateProperLink } from './generateProperLink';

/**
 * Decrypts the CSSBUY link and returns the corresponding proper link.
 *
 * @param {string | URL} href - The CSSBUY link to decrypt.
 * @returns {URL | undefined} The decrypted proper link as a URL object, or undefined if decryption failed.
 */
export function decryptCssbuy(href: string | URL): URL | undefined {
  const url = typeof href === 'string' ? new URL(href) : href;

  if (url.pathname.startsWith('/item-micro')) {
    const id = url.pathname.split('-')[2].split('.')[0];
    if (id) {
      return new URL(generateProperLink('weidian', id));
    }
  }
  if (url.pathname.startsWith('/item-1688')) {
    const id = url.pathname.split('-')[2].split('.')[0];
    if (id) {
      return new URL(generateProperLink('1688', id));
    }
  }
  if (url.pathname.startsWith('/item')) {
    const id = url.pathname.split('-')[1].split('.')[0];
    if (id) {
      return new URL(generateProperLink('taobao', id));
    }
  }
  return undefined;
}
