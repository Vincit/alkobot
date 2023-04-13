const cache = require('memory-cache');
const STORES_URL = 'https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/fi_FI/-/EUR/ALKO_ViewStoreLocator-StoresJSON';
const fetchAlkoData = async () => {
  let data = cache.get('alko-data');

  if(!data) {
    data = (await fetch(STORES_URL)).json();
    cache.put('alko-data', data, 1000 * 60 * 30);
  }

  return data;
}

module.exports = fetchAlkoData;
