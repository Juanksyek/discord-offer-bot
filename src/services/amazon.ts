import axios from 'axios';
import * as cheerio from 'cheerio';

export async function extractProductInfo(url: string) {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  const asin = asinMatch?.[1];

  if (!asin) throw new Error('ASIN no encontrado en la URL');

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  const $ = cheerio.load(html);

  const name = $('#productTitle').text().trim();
  const priceText =
    $('#corePriceDisplay_desktop_feature_div .a-offscreen').first().text().replace(/[^0-9.]/g, '') ||
    $('.a-price .a-offscreen').first().text().replace(/[^0-9.]/g, '');
  const image = $('#landingImage').attr('src') || $('#imgTagWrapperId img').attr('src');

  const price = parseFloat(priceText);

  if (!name || !price || !image) {
    console.log('DEBUG info:', { name, price, image });
    throw new Error('No se pudo obtener info del producto');
  }

  return {
    asin,
    name,
    price,
    image,
    url
  };
}
