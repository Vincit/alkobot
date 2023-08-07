import openAiMessage, {Message} from "./openAiMessage";
import getIsClosedDataMessage from "./getIsClosedDataMessage";

const commonMessage: Message = {
  role: 'system',
  content: 'Olet Alkon chat asiakaspalvelija. Vastaa viestiin hauskasti. Suosittele viesteissä jotain vuodenaikaan sopivaa alkoholijuomaa. Tänään on:' + new Date().toString(),
};

export default async (isClosedData) => {
  try {
    const isClosedDataMessage = getIsClosedDataMessage(isClosedData);
    const isClosedPrompt: Message = {
      role: 'system',
      content: 'Kerro hauskasti onko Alko auki. Jos se on kiinni, se on paha asia ja varoita siitä',
    };
    const message = await openAiMessage([commonMessage, isClosedDataMessage, isClosedPrompt]);
    return message;
  } catch (error) {
    const closedTomorrowMessage = `:alko: on kiinni huomenna, ${isClosedData.today ? 'ei kun baariin vaan!' : `pidä kiirettä! ${isClosedData.isActualData ? ':gotta-go-fast:' : ':shoe-nb:'}`}`;
    const openTomorrowMessage = `:alko: ${isClosedData.isActualData ? 'suattaapi' : 'saattaapi'} olla huomenna auki, ei hätää!`;
    return isClosedData.tomorrow ? closedTomorrowMessage : openTomorrowMessage;
  }
};
