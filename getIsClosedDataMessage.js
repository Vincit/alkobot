const getIsClosedDataMessage = (isClosedData) => ({
  role: 'system',
  content: `Alko on tänään ${isClosedData.today ? 'kiinni' : 'auki'} ja huomenna ${isClosedData.tomorrow ? 'kiinni' : 'auki'}`,
});

module.exports = getIsClosedDataMessage;
