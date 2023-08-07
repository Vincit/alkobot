const alkoSearch = require('./alkoSearch');
const isClosedMessage = require('./isClosedMessage');
const alkoIsClosed = require('./alkoIsClosed');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = () => readline.question('Mitä asiaa? \n', async query => {
  console.log('Ootappa kun mietin...\n');
  if (!query) {
    const result = await isClosedMessage(await alkoIsClosed());
    console.log(result);
    return ask();
  }
  const result = await alkoSearch(query, 'Mikko Mallikas');
  console.log(result);
  return ask();
});

ask();
