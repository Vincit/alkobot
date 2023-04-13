const fetchAlkoData = require('./fetchAlkoData');
const openAiMessage = require('./openAiMessage');
const getIsClosedDataMessage = require('./getIsClosedDataMessage');
const alkoIsClosed = require('./alkoIsClosed');

const BASE_URL = 'https://alko.fi/myymalat-palvelut/';
const linkMaker = (store) => {
  const url = BASE_URL + store.storeId;
  const link = `<${url}|${store.name}>`;
  return link;
};

const getSystemMessage = (user) => ({
  role: 'system',
  content: `Olet ystävällinen Alkon chat asiakaspalvelija. Vastaa viestiin hauskasti. Olisi myös hyvä jos viestissä suositeltaisiin jotain alkoholijuomaa liittyen käyttäjän viestiin tai hetkeen. Asiakas: ${user}. Tänään on: ${new Date().toString()}`,
});

const alkoSearch = async (query, user) => {
  let message;
  try {
    const data = await fetchAlkoData();
    const stores = data.stores.filter(store => store.outletTypeId === 'outletType_myymalat').filter(store => store.name.toLowerCase().includes(query.toLowerCase()));
    message = stores.map(store => `${linkMaker(store)}
Avoinna tänään: ${store.OpenDay0 === '0' ? 'Suljettu' : store.OpenDay0}
Avoinna huomenna: ${store.OpenDay1 === '0' ? 'Suljettu' : store.OpenDay1}`).join(`
----------------------------------------
`);
  } catch (e) {
  }

  if (!message) {
    try {
      const userMessage = {
        role: 'user',
        content: query,
      };
      const queryMessages = [getSystemMessage(user), getIsClosedDataMessage(await alkoIsClosed()), userMessage];
      message = await openAiMessage(queryMessages);
    } catch (error) {
      message = `Hakusanalla "${query}" ei löytynyt yhtään kauppaa :sadpanda:`;
    }
  }

  return message;
};

module.exports = alkoSearch;
