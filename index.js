const { App } = require('@slack/bolt');
const config = require('./config.js');

const app = new App({
  signingSecret: config.signingSecret,
  token: config.token, // user token
});

app.shortcut('remove_thread_replies', async ({ body, ack }) => {
  await ack();

  const channel = body.channel.id;
  const ts = body.message.ts;
  const threadTs = body.message.thread_ts;

  if (!threadTs) {
    return;
  }

  // Trigger only on parent message to avoid mistakes
  if (threadTs === ts) {
    let messages;
    try {
      messages = await app.client.conversations.replies({channel, ts: threadTs});
    } catch (error) {
      console.log(error);
      return;
    }

    for (const message of messages.messages) {
      try {
        await app.client.chat.delete({channel, ts: message.ts, as_user: true});
      } catch (error) {
        console.log(error);
      }
    }
  }
});

(async () => {
  const port = 3000;
  await app.start(port);

  console.log('Thread cleaner is running on port', port);
})();
