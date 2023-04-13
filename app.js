const fs = require('fs');
const path = require('path');
const Slack = require('@slack/bolt');
const alkoIsClosed = require('./alkoIsClosed');
const alkoSearch = require('./alkoSearch');
const isClosedMessage = require('./isClosedMessage');

const isDevelopmentMode = process.env.NODE_ENV === 'development';
const certPath = '/home/ilkka/cert';

// read certificates from disk
const privateKey = fs.readFileSync(isDevelopmentMode ? path.join(certPath, 'express-selfsigned.key') : path.join(certPath, 'gaiafm_org.key'), 'utf8');
const certificate = fs.readFileSync(isDevelopmentMode ? path.join(certPath, 'express-selfsigned.crt') : path.join(certPath, 'gaiafm_org.crt'), 'utf8');
const chain = isDevelopmentMode ? '' : fs.readFileSync(path.join(certPath, 'gaiafm_org.ca-bundle'), 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: chain };

const slackApp = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

setInterval(async () => {
  if (new Date().getHours() === 11) {
    const closed = await alkoIsClosed();
    if (closed.tomorrow) {
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

slackApp.event('app_mention', async ({ event, say }) => {
  const { text, user } = event;

  const userMentionString = `<@U04SXP9UJAV>`;
  if (!text.toUpperCase().startsWith(userMentionString)) {
    // skip messages not addressed directly to the bot for now at least
    return;
  }

  // strip the mention from the message
  const queryWithoutMention = text.slice(userMentionString.length).trim();

  if (queryWithoutMention.length < 2) {
    const message = await isClosedMessage(await alkoIsClosed());
    return await say({ text: message, thread_ts: event.thread_ts });
  }

  // Leave channel when requested by Ilkka Pelkonen
  if (user === 'U03T8HLSPAS' && queryWithoutMention.toLowerCase().startsWith('please leave this channel')) {
    slackApp.client.conversations.leave({ channel: event.channel });
    return;
  }

  const userInfo = await slackApp.client.users.info({ user });

  const message = await alkoSearch(queryWithoutMention, userInfo.user?.profile?.display_name || '');
  return await say({ text: message, thread_ts: event.ts });
});

slackApp.event('message', async ({ event, say }) => {
  const { text, user, channel_type } = event;
  
  if (channel_type !== 'im') {
    return;
  }

  const userInfo = await slackApp.client.users.info({ user });

  const message = await alkoSearch(text, userInfo.user?.profile?.display_name || '');
  return await say({ text: message, thread_ts: event.thread_ts });
});

(async () => {
  // Start the app
  await slackApp.start(3003, credentials);
  console.log('Slack app is running!');
})();
