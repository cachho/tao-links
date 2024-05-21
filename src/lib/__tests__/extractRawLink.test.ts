import { agents, marketplaces } from '../../models';
import { extractRawLink } from '../extractRawLink';
import { generateAgentLink } from '../generateAgentLink';
import { generateMarketplaceLink } from '../generateRawLink';

describe('extractRawLink', () => {
  it('should extract the inner URL for a valid agent link', () => {
    const href =
      'https://www.wegobuy.com/en/page/buy?from=search-input&url=https%3A%2F%2Fitem.taobao.com%2Fitem.html%3Fid%3D675330231400&partnercode=6t86Xk';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.html?id=675330231400')
    );
  });

  it('should extract the inner URL from old sugargoo link', () => {
    const href =
      'https://sugargoo.com/index/item/index.html?tp=taobao&searchlang=en&url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D5789470155';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://weidian.com/item.html?itemID=5789470155')
    );
  });

  it('should extract the inner URL from esugargoo link', () => {
    const href =
      'https://www.esugargoo.com/#/home/productDetail?productLink=https%253A%252F%252Fitem.taobao.com%252Fitem.htm%253Fspm%253Da1z10.3-c.w4002-13979990307.10.46c7707e2PW6oL%2526id%253D691541677564&memberId=341948605864607954';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL(
        'https://item.taobao.com/item.htm?spm=a1z10.3-c.w4002-13979990307.10.46c7707e2PW6oL&id=691541677564'
      )
    );
  });

  it('should extract the inner URL from new sugargoo link', () => {
    const href =
      'https://www.sugargoo.com/#/home/productDetail?productLink=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fspm%3Da1z10.3%26id%3D695240235157&memberId=123';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?spm=a1z10.3&id=695240235157')
    );
  });

  it('should work with double encoded sugargoo links', () => {
    const href =
      'https://www.sugargoo.com/#/home/productDetail?productLink=https%253A%252F%252Fweidian.com%252Fitem.html%253FitemID%253D5418645467%2526spider_token%253D4572';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL(
        'https://weidian.com/item.html?itemID=5418645467&spider_token=4572'
      )
    );
  });

  it('should extract the inner URL for a valid obscure agent link', () => {
    const href =
      'https://m.superbuy.com/en/goodsdetail/?url=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D705339617846';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=705339617846')
    );
  });

  it('should return undefined for a link without the inner URL parameter', () => {
    const href = 'https://www.example.com/';
    const rawLink = new URL(href);
    expect(() => extractRawLink(rawLink)).toThrowError(
      "Error extracting inner link, 'url' query param not found: https://www.example.com/"
    );
  });

  it('should accept a URL object as input', () => {
    const href =
      'https://www.wegobuy.com/en/page/buy?from=search-input&url=https%3A%2F%2Fitem.taobao.com%2Fitem.html%3Fid%3D675330231400&partnercode=6t86Xk';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.html?id=675330231400')
    );
  });

  it('should extract the inner URL for a valid cssbuy raw link with parameters', () => {
    const href =
      'https://www.cssbuy.com/item-675330231400?promotionCode=Y2h3ZWJkZXZlbG9wbWVudA';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=675330231400')
    );
  });

  it('should extract the inner URL for a valid cssbuy raw link', () => {
    const href = 'https://www.cssbuy.com/item-675330231400';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=675330231400')
    );
  });

  it('should return undefined for an invalid cssbuy raw link', () => {
    const href = 'https://www.cssbuy.com';
    expect(() => extractRawLink(new URL(href))).toThrowError(
      'Error extracting inner link, cssbuy link could not be decrypted: https://www.cssbuy.com/'
    );
  });

  it('should be able to handle encrypted taobao pandabuy links', () => {
    const href =
      'https://www.pandabuy.com/product?url=PJ9emDFVd3v76X25eDSVqIb3mLH4Md7zsyLlOTWmhLylMKdL6gbFKJ94ysL%2FSI3tYF1YOL6lhXMdRWOn3qm5FSOGuAaHx4uHPsYpA1hNETE3aRnXLdfh3RnL5vyVxk2ezXnQ8DWAgYzbSSdI&utm_source=url&utm_medium=pdb&utm_campaign=normal';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL(
        'https://www.taobao.com/list/item/674680652328.htm?spm=a21wu.10013406.taglist-content.10.1d9865ebWR4RYC'
      )
    );
  });

  it('should be able to handle mobile pandabuy links', () => {
    const href =
      'https://m.pandabuy.com/product?url=https%3A%2F%2Fdetail.tmall.com%2Fitem.htm%3Fid%3D625144747417&inviteCode=84QGEFBNY';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://detail.tmall.com/item.htm?id=625144747417')
    );
  });

  it('should be able to handle hoobuy links', () => {
    const href =
      'https://hoobuy.com/product/1/692787834585?utm_source=share&utm_medium=product_details';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=692787834585')
    );
  });

  it('should be able to handle hoobuy mobile links', () => {
    const href =
      'https://hoobuy.com/m/product/2/7234262753?utm_source=share&utm_medium=product_details';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://weidian.com/item.html?itemID=7234262753')
    );
  });

  it('should be able to handle allchinabuy links', () => {
    const href =
      'https://www.allchinabuy.com/en/page/buy/?nTag=Home-search&from=search-input&_search=url&position=&url=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D675330231300&partnercode=abc';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=675330231300')
    );
  });

  it('should be able to handle superbuy mobile links', () => {
    const href =
      'https://m.superbuy.com/home/#/goodsDetail?nTag=Home-search&from=search-input&_search=url&url=https://detail.tmall.com/item.htm?id=66608981238';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://detail.tmall.com/item.htm?id=66608981238')
    );
  });

  it('should be able to handle basetao links (taobao)', () => {
    const href =
      'https://www.basetao.com/best-taobao-agent-service/products/agent/taobao/655259799823.html';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=655259799823')
    );
  });

  it('should be able to handle basetao links (weidian)', () => {
    const href =
      'https://www.basetao.com/best-taobao-agent-service/products/agent/weidian/7231813765.html';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://weidian.com/item.html?itemID=7231813765')
    );
  });

  it('should be able to handle basetao links (1688)', () => {
    const href =
      'https://www.basetao.com/best-taobao-agent-service/products/agent/1688/641649880094.html';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://detail.1688.com/offer/641649880094.html')
    );
  });

  it('should be able to handle kameymall links', () => {
    const href =
      'https://www.kameymall.com/purchases/search/item?url=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D732843623706';
    const rawLink = extractRawLink(new URL(href));
    expect(rawLink).toEqual(
      new URL('https://item.taobao.com/item.htm?id=732843623706')
    );
  });

  it('should throw an error for kameymall purchase history links', () => {
    const href =
      'https://www.kameymall.com/purchases/1730295605736697858/%E3%80%90%E6%9C%80%E9%AB%98%E7%89%88%E6%9C%AC%E3%80%91%E7%99%BE%E6%90%ADchrome-hearts%E5%85%8B%E7%BD%97%E5%BF%83%E9%A1%B9%E9%93%BE-%E5%85%8B%E7%BD%97%E5%BF%83%E5%8F%8C%E5%8D%81%E5%AD%97%E6%9E%B6%E6%83%85%E4%BE%A3%E9%A1%B9%E9%93%BE-%E6%BD%AE%E6%B5%81%E7%94%B7%E5%A3%AB%E5%A5%B3%E5%A3%AB%E5%8D%81%E5%AD%97%E6%9E%B6%E9%A1%B9%E9%93%BE%E5%A5%97%E9%93%BE';
    expect(() => extractRawLink(new URL(href))).toThrowError(
      'Kameymall link is a purchase history link. This type of link cannot be decoded.'
    );
  });

  test('should work for all agents and marketplaces', () => {
    const testId = '6481396504';
    marketplaces.forEach((marketplace) => {
      agents.forEach((agent) => {
        const marketplaceLink = generateMarketplaceLink(marketplace, testId);
        const agentLink = generateAgentLink(agent, marketplaceLink);
        if (marketplace === 'tmall') {
          // Sometimes, tmall can't be reversed and it's a taobao link.
          expect([
            marketplaceLink.href,
            generateMarketplaceLink('taobao', testId).href,
          ]).toContain(extractRawLink(agentLink).href);
        } else {
          expect(extractRawLink(agentLink).href).toBe(marketplaceLink.href);
        }
      });
    });
  });
});
