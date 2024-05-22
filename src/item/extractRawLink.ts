import type { AgentURL, RawURL } from '../models/LinkTypes';
import { decodeBasetao } from './decode/decodeBasetao';
import { decodeCnFans } from './decode/decodeCnFans';
import { decodeCssbuy } from './decode/decodeCssbuy';
import { decodeHoobuy } from './decode/decodeHoobuy';
import { decryptPandabuy } from './decrypt/decryptPandabuy';
import { detectAgent } from './detectAgent';

/**
 * @Internal
 * Extracts the raw link from the search params of a provided (agent) URL.
 * Is internal because end-users can use the `toRaw` or `generateRawLinks` to extract a raw link with more flexible inputs.
 *
 * @param {AgentURL} href - The URL from which to extract the raw link. It's assumed that it's typeguarded.
 * @param {boolean} [cantBeCssbuy] - Indicates whether the raw link cannot be from the 'cssbuy' agent. If this is true the call to detectAgent is skipped. *Legacy functionality that makes little sense on a internal function.* Default is false.
 * @returns {RawURL} The extracted raw link as a URL object, or undefined if no raw link is found.
 */
export function extractRawLink(href: AgentURL, cantBeCssbuy?: boolean): RawURL {
  const link = href instanceof URL ? href : new URL(href);

  if (!cantBeCssbuy && detectAgent(link.href) === 'cssbuy') {
    const innerLink = decodeCssbuy(link);
    if (!innerLink) {
      throw new Error(
        `Error extracting inner link, cssbuy link could not be decrypted: ${link.href}`
      );
    }
    return innerLink; // Forced because it's assumed that agentUrl is valid.
  }

  const agent = detectAgent(link.href);

  if (agent === 'sugargoo') {
    const safeLink = new URL(link.href.replace('/#/', '/'));
    const innerParam = safeLink.searchParams.get('productLink');
    if (innerParam) {
      try {
        return new URL(innerParam);
      } catch {
        return new URL(decodeURIComponent(innerParam));
      }
    }
  }

  if (agent === 'superbuy' && link.hostname === 'm.superbuy.com') {
    if (link.href.includes('/#/')) {
      link.href = link.href.replace('/#/', '/');
    }
  }

  if (agent === 'cnfans') {
    return decodeCnFans(link);
  }

  if (agent === 'hoobuy') {
    const innerLink = decodeHoobuy(link);
    if (!innerLink) {
      throw new Error(`Could not extract inner Hoobuy link from ${link.href}`);
    }
    return innerLink;
  }

  if (agent === 'basetao') {
    return decodeBasetao(link);
  }

  if (agent === 'kameymall') {
    if (link.pathname.startsWith('/purchases')) {
      // Check that the second part of the pathname is purely numerical
      const segments = link.pathname.split('/');
      if (segments[2] && /^\d+$/.test(segments[2])) {
        throw new Error(
          'Kameymall link is a purchase history link. This type of link cannot be decoded.'
        );
      }
      // Regular Kameymall links have a `url` search parameter
    }
  }

  let innerParam: string | null = null;

  if (agent === 'ezbuycn') {
    innerParam = link.searchParams.get('key');
  }

  if (!innerParam) {
    innerParam = link.searchParams.get('url');
  }
  if (!innerParam) {
    throw new Error(
      `Error extracting inner link, 'url' query param not found: ${link.href}`
    );
  }

  if (agent === 'pandabuy' && innerParam.startsWith('PJ')) {
    const extracted = decryptPandabuy(innerParam);
    return new URL(extracted);
  }

  return new URL(innerParam); // Forced because it's assumed that agentUrl is valid.
}
