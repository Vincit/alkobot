import fetchAlkoData from './fetchAlkoData';

const BASE_URL = 'https://alko.fi/myymalat-palvelut/';
const linkMaker = (store) => {
  const url = BASE_URL + store.storeId;
  const link = `<${url}|${store.name}>`;
  return link;
};



export default async (query: string) => {
  let message;
  try {
    const data = await fetchAlkoData();
    const stores = data.stores.filter(store => store.outletTypeId === 'outletType_myymalat').filter(store => store.name?.toLowerCase().includes(query?.toLowerCase()));
    message = stores.map(store => `${linkMaker(store)}
Avoinna tänään: ${store.OpenDay0 === '0' ? 'Suljettu' : store.OpenDay0}
Avoinna huomenna: ${store.OpenDay1 === '0' ? 'Suljettu' : store.OpenDay1}`).join(`
----------------------------------------
`);
    return message;
  } catch (e) {
    console.error('alkoSearch: alkoSearch', e);
  }

};
