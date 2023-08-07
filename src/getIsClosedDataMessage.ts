import {Message} from "./openAiMessage";

export default (isClosedData): Message => ({
  role: 'system',
  content: `Alko on tänään ${isClosedData.today ? 'kiinni' : 'auki'} ja huomenna ${isClosedData.tomorrow ? 'kiinni' : 'auki'}`,
});
