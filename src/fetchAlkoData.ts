import cache from "memory-cache";

const STORES_URL = 'https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/fi_FI/-/EUR/ALKO_ViewStoreLocator-StoresJSON';
export default async () => {
  let data = cache.get('alko-data');

  if(!data) {
    console.log(1);
    let fetchData = await fetch(STORES_URL);
    console.log(fetchData);
    data = await fetchData.json();
    console.log(data);
    cache.put('alko-data', data, 1000 * 60 * 30);
  }

  return data;
}
