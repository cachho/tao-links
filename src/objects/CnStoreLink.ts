import { detectMarketplace } from '../lib/detectMarketplace';
import type {
  AgentWithRaw,
  Id,
  Marketplace,
  Referral,
  SafeInstantiateResult,
} from '../models';
import type { CnLinkSerial } from '../models/CnLink';
import type { ICnStoreLink } from '../models/CnStoreLink';
import { extractId } from '../store/extractId';
import { extractRawLink } from '../store/extractRawLink';
import { generateAgentLink } from '../store/generateAgentLink';
import { generateRawLink } from '../store/generateRawLink';
import { isAgentLink } from '../store/isAgentLink';
import { isRawLink } from '../store/isRawLink';

/**
 * An ambigous link object. Can be converted on the fly to a raw link or any agent URL object using the `as` method.
 * If you have a marketplace and id already, you can use the library's `generateRawLink` function with these parameters as an input.
 */
export class CnStoreLink implements ICnStoreLink {
  marketplace: Marketplace;

  id: Id;

  referrals: Referral;

  /**
   * Construct object from link.
   * @param {URL | string} href - Link to generate the object from. Can be a raw link or an agent link.
   * @param {Referral} [referrals] - Object to use referral links from. Referrals can still be entered when using the `as` method. Optional.
   */
  constructor(href: URL | string, referrals: Referral = {}) {
    const link = href instanceof URL ? href : new URL(href);

    const getRawLink = () => {
      if (isRawLink(link)) {
        return link;
      }
      if (isAgentLink(link)) {
        return extractRawLink(link);
      }
      throw new Error(
        `CnLink object could not be initialized. Neither agent nor raw link could be detected from: ${link.href}`
      );
    };

    const innerLink = getRawLink();
    const marketplace = detectMarketplace(innerLink);

    if (!marketplace) {
      throw new Error(
        `CnLink object could not be initialized. Marketplace could not be detected from inner link: ${innerLink.href}`
      );
    }

    this.marketplace = marketplace;
    this.id = extractId(innerLink);
    this.referrals = referrals ?? undefined;
  }

  /**
   * Convert to a URL object of any target type.
   * @param {AgentWithRaw} target - Agent name to convert to, or `raw` to get a sanitized link for the orginal marketplace
   * @param {string} referral - Referral code to use in this URL. If undefined, it will try to get the referral from the `referrals` attribute.
   * @param {string} [ra] - Set tracking parameters in the URL for internal tracking.
   * @returns {AgentURL} - URL object that contains the target link. You can get the full link string with the `.href` attribute.
   */
  as(target: AgentWithRaw, referral?: string, ra?: string) {
    const getRefferal = () => {
      if (referral) return referral;
      if (target === 'raw') return undefined;
      return this.referrals[target];
    };

    return generateAgentLink(
      target,
      this.marketplace,
      this.id,
      getRefferal(),
      ra
    );
  }

  /**
   * Serialize CnLink object
   * @returns serialized CnLink object
   */
  serialize(): CnLinkSerial {
    return {
      marketplace: this.marketplace,
      id: this.id,
    };
  }

  /**
   * Create CnLinks instance from serial
   * @param marketplace
   * @param id
   * @returns new CnLinks instance
   */
  static deserialize({ marketplace, id }: CnLinkSerial) {
    const rawUrl = generateRawLink(marketplace, id);
    return new CnStoreLink(rawUrl);
  }

  /**
   * Method to safely instantiate CnLink object without throwing an error. Inspired by `zod.safeParse`
   * @param {URL | string} href - Link to generate the object from. Can be a raw link or an agent link.
   * @param {Referral} [referrals] - Object to use referral links from. Referrals can still be entered when using the `as` method. Optional.
   * @returns {SafeInstantiateResult} - Object that contains the result of the instantiation. If successful, it will contain the CnLink object. If failed, it will contain the error message.
   * @example
   * const response = CnLink.safeInstantiate(link);
   * if (response.success) {
   *  doSomething(response.data.as(agent));
   * } else {
   *  console.error(response.error);
   * }
   */
  static safeInstantiate(
    href: URL | string,
    referrals: Referral = {}
  ): SafeInstantiateResult<CnStoreLink> {
    try {
      const c = new CnStoreLink(href, referrals);
      return { success: true, data: c } as SafeInstantiateResult<CnStoreLink>;
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : '',
      } as SafeInstantiateResult<CnStoreLink>;
    }
  }
}
