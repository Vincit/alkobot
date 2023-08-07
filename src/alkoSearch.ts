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
    console.log(3);
    const data = await fetchAlkoData();
    console.log(4);
    const stores = data.stores.filter(store => store.outletTypeId === 'outletType_myymalat').filter(store => store.name.toLowerCase().includes(query.toLowerCase()));
    console.log(5);
    message = stores.map(store => `${linkMaker(store)}
Avoinna tänään: ${store.OpenDay0 === '0' ? 'Suljettu' : store.OpenDay0}
Avoinna huomenna: ${store.OpenDay1 === '0' ? 'Suljettu' : store.OpenDay1}`).join(`
----------------------------------------
`);
    console.log(6);
    return message;
  } catch (e) {
    console.error('alkoSearch: alkoSearch', e);
  }

};
