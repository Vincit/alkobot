import cache from "memory-cache";

const STORES_URL = 'https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/fi_FI/-/EUR/ALKO_ViewStoreLocator-StoresJSON';
export default async () => {
  let data = cache.get('alko-data');

  if(!data) {
    let headers = new Headers({
      'Accept'       : 'application/json',
      'Content-Type' : 'application/json',
      'User-Agent'   : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    });

    let fetchData = await fetch(STORES_URL, {
      method: 'get',
      headers
    });

    data = await fetchData.json();
    cache.put('alko-data', data, 1000 * 60 * 30);
  }

  return data;
}
