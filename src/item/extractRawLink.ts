import { decryptPandabuy } from '../lib/decryptPandabuy';
import { detectAgent } from '../lib/detectAgent';
import { extractInnerParam } from '../lib/extractInnerParam';
import type { AgentURL, RawURL } from '../models/LinkTypes';
import { decodeAcbuy } from './decode/decodeAcbuy';
import { decodeBasetao } from './decode/decodeBasetao';
import { decodeCnFans } from './decode/decodeCnFans';
import { decodeCssbuy } from './decode/decodeCssbuy';
import { decodeEzbuyCn } from './decode/decodeEzbuyCn';
import { decodeHoobuy } from './decode/decodeHoobuy';
import { decodeHubbuyCn } from './decode/decodeHubbuyCn';
import { decodeJoyabuy } from './decode/decodeJoyabuy';
import { decodeKameymall } from './decode/decodeKameymall';
import { decodeLovegobuy } from './decode/decodeLoveGoBuy';
import { decodeMulebuy } from './decode/decodeMulebuy';
import { decodeOopbuy } from './decode/decodeOopbuy';
import { decodeOrientdig } from './decode/decodeOrientdig';
import { decodePanglobalbuy } from './decode/decodePanglobalbuy';
import { decodePonybuy } from './decode/decodePonybuy';
import { decodeSifubuy } from './decode/decodeSifubuy';
import { decodeSugargoo } from './decode/decodeSugargoo';
import { decodeSuperbuy } from './decode/decodeSuperbuy';

/**
 * @Internal
 * Extracts the raw link from the search params of a provided (agent) URL.
 * Is internal because end-users can use the `toRaw` or `generateRawLinks` to extract a raw link with more flexible inputs.
 *
 * @param {AgentURL} href - The URL from which to extract the raw link. It's assumed that it's typeguarded.
 * @returns {RawURL} The extracted raw link as a URL object, or undefined if no raw link is found.
 */
export function extractRawLink(href: AgentURL): RawURL {
  const link = href instanceof URL ? href : new URL(href);
  const agent = detectAgent(link.href);

  try {
    if (!agent) {
      throw new Error('Agent not detected.');
    }

    if (agent === 'cssbuy') {
      return decodeCssbuy(link);
    }

    if (agent === 'sugargoo') {
      return decodeSugargoo(link);
    }

    if (agent === 'superbuy') {
      return decodeSuperbuy(link);
    }

    if (agent === 'cnfans') {
      return decodeCnFans(link);
    }

    if (agent === 'mulebuy') {
      return decodeMulebuy(link);
    }

    if (agent === 'joyabuy') {
      return decodeJoyabuy(link);
    }

    if (agent === 'orientdig') {
      return decodeOrientdig(link);
    }

    if (agent === 'hoobuy') {
      return decodeHoobuy(link);
    }

    if (agent === 'basetao') {
      return decodeBasetao(link);
    }

    if (agent === 'hubbuycn') {
      return decodeHubbuyCn(link);
    }

    if (agent === 'kameymall') {
      return decodeKameymall(link);
    }

    if (agent === 'oopbuy') {
      return decodeOopbuy(link);
    }

    if (agent === 'lovegobuy') {
      return decodeLovegobuy(link);
    }

    if (agent === 'ponybuy') {
      return decodePonybuy(link);
    }

    if (agent === 'panglobalbuy') {
      return decodePanglobalbuy(link);
    }

    if (agent === 'ezbuycn') {
      return decodeEzbuyCn(link);
    }

    if (agent === 'sifubuy') {
      return decodeSifubuy(link);
    }

    if (agent === 'acbuy') {
      return decodeAcbuy(link);
    }
    throw new Error('Agent does not have a decoder. This may be expected.');
  } catch (error) {
    // General fallback starts here
    const innerParam = extractInnerParam(link);

    // Finally Throw error
    if (!innerParam) {
      if (error instanceof Error) {
        throw new Error(
          `Error extracting inner link. Fallback unsuccessful. Error: (${error.message}) - ${link.href}`
        );
      } else
        throw new Error(
          `Error extracting inner link. Fallback unsuccessful. Error: ${link.href}`
        );
    }

    // Special case for pandabuy decryption

    if (agent === 'pandabuy' && innerParam.startsWith('PJ')) {
      const extracted = decryptPandabuy(innerParam);
      return new URL(extracted);
    }

    try {
      return new URL(innerParam);
    } catch {
      const decoded = decodeURIComponent(innerParam);
      return new URL(decoded);
    }
  }
}
