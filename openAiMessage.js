const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const openAiMessage = async (messages) => {
  if (!configuration.apiKey) {
    return 'OpenAI ei vastaa, koska API key puuttuu :sadpanda:';
  }
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.2,
      max_tokens: 2000,
      n: 1,
      stream: false,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
  }

  return 'OpenAI ei vastaa :sadpanda:';
};

module.exports = openAiMessage;



