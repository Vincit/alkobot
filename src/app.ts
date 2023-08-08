import {App, AppMentionEvent, KnownEventFromType} from "@slack/bolt";
import alkoIsClosed from "./alkoIsClosed"
import alkoSearch from "./alkoSearch";
import isClosedMessage from "./isClosedMessage";
import {GenericMessageEvent} from "@slack/bolt/dist/types/events/message-events";
import getIsClosedDataMessage from "./getIsClosedDataMessage";
import openAiMessage, {Message} from "./openAiMessage";
import { ConversationsHistoryResponse } from "@slack/web-api";
import { v2 } from "@google-cloud/translate";

const botAdmins = process.env.BOT_ADMINS ? process.env.BOT_ADMINS.split(',') : [];

const slackApp = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

let googleTranslate: v2.Translate = null;

async function getLanguage(text) {
  let [detections] = await googleTranslate.detect(text);

  if (Array.isArray(detections)) {
    if (detections.length < 1) {
      return 'en';
    }

    return detections[0].language;
  }

  return detections.language;
}

setInterval(async () => {
  if (new Date().getHours() === 11) {
    const closed = await alkoIsClosed();
    if (!closed.today && closed.tomorrow) {
      const conversations = await slackApp.client.users.conversations({
        exclude_archived: true,
        types: 'public_channel,private_channel',
      });
      conversations.channels.forEach(async (channel) => {
        const { id, name } = channel;
        if (name.startsWith('1vincit') || name.startsWith('ask-')) {
          slackApp.client.conversations.leave({ channel: id });
        } else {
          slackApp.client.chat.postMessage({ channel: id, text: await isClosedMessage(closed) });
        }
      });
    }
  }
}, 1000 * 60 * 60);
const ALKO_BOT_ID = 'U04SXP9UJAV';
slackApp.event('app_mention', async ({ event, say }) => {

  const { text, user } = event;

  const userMentionString = `<@${ALKO_BOT_ID}>`;
  if (!text.toUpperCase().startsWith(userMentionString)) {
    // skip messages not addressed directly to the bot for now at least
    return;
  }

  // strip the mention from the message
  const queryWithoutMention = text.slice(userMentionString.length).trim();

  if (queryWithoutMention.length < 2) {
    const message = await isClosedMessage(await alkoIsClosed());
    await say({ text: message, thread_ts: event.thread_ts });
    return;
  }

  // Leave channel when requested by an admin
  if (botAdmins.includes(user) && queryWithoutMention.toLowerCase().startsWith('please leave this channel')) {
    await slackApp.client.conversations.leave({ channel: event.channel });
    return;
  }

  const message = await respondToMessage(event);
  await say({ text: message, thread_ts: event.ts });
});

const respondToMessage = async (event: GenericMessageEvent | AppMentionEvent): Promise<string> => {
  const { text} = event as GenericMessageEvent;
  let message = await alkoSearch(text);
  if (message) return message;
  return aiMessage(event);
}

const getSystemMessage = (user: string, language: string): Message => ({
  role: 'system',
  content: `Olet ystävällinen Alkon chat asiakaspalvelija. Vastaa viestiin hauskasti. Olisi myös hyvä jos viestissä suositeltaisiin jotain alkoholijuomaa liittyen käyttäjän viestiin tai hetkeen jos se sopii tilanteeseen. Asiakas: ${user}. Tänään on: ${new Date().toString()}. Vastaa kielellä "${language}".`,
});

const aiMessage = async (event: GenericMessageEvent | AppMentionEvent): Promise<string | undefined> => {
  const { text, user, channel, thread_ts, ts } = event;
  const userInfo = await slackApp.client.users.info({ user });
  let message = undefined;
  try {
    const fiveHrs = 60 * 60 * 12;
    let contextMessages: ConversationsHistoryResponse;

    if(thread_ts) {
      contextMessages = await slackApp.client.conversations.replies({ channel, ts: thread_ts, limit: 20 });
    } else {
      contextMessages = await slackApp.client.conversations.history({ channel, oldest: `${Number(ts) - fiveHrs}`, limit: 20 });
    }

    const userMessage: Message = {
      role: 'user',
      content: text,
    };

    const queryMessages: Message[] = [
      getSystemMessage( userInfo.user?.profile?.display_name || '', await getLanguage(text)),
      getIsClosedDataMessage(await alkoIsClosed()),
      ...contextMessages.messages.map((message): Message => ({
        role: message.user === ALKO_BOT_ID ? 'assistant' :'user',
        content: message.text || '',
      })),
      userMessage,
    ];
    message = await openAiMessage(queryMessages);
  } catch (error) {

  }
  return message;
}

const isGenericMessageEvent = (event: KnownEventFromType<'message'>): event is GenericMessageEvent => {
  return event.channel_type === 'im';
}

slackApp.event('message', async ({ event, say }) => {
  if (!isGenericMessageEvent(event)) {
    return;
  }

  const { thread_ts } = event;
  //const initialMessage = await say({ text: ':drumrolll:', thread_ts });
  try {
    const message = await respondToMessage(event);
    //await slackApp.client.chat.update({ text: message, channel: event.channel, ts: initialMessage.ts });
    await say({ text: message, thread_ts });
  } catch (error) {
    //await slackApp.client.chat.update({ text: "Error happened, I'm sorry :sadrobot:", channel: event.channel, ts: initialMessage.ts });
    await say({ text: "Error happened, I'm sorry :sadrobot:", thread_ts });
  }
});

(async () => {
  // Start the app
  await slackApp.start(8080);
  googleTranslate = new v2.Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
  console.log('Alkobot is running!');
})();
