const CIClient = require('ci-client');
const CIconfig = require('../client-config.js');

require('dotenv').config();

const client = new CIClient(CIconfig);

const userParser = ctx => ctx.envelope.user.id;

client.setUserParser(userParser);

client.setPrivateChatParser(ctx => ctx.envelope.room === undefined);

client.setUserPropertiesParser(ctx => {
  return {
    flowdockUsername: ctx.envelope.user.name,
    flowdockId: ctx.envelope.user.id
  };
});

function Client(robot) {
  const messageReceiver = (action, message, context) => {
    console.dir(context.envelope);
    robot.send(context.envelope, message);
  };

  client.setReceiver(messageReceiver);

  robot.respond(/(.*)/i, (res) => {
    require('fs').writeFileSync('envelope.json', JSON.stringify(res.envelope, null, 2));
    const question = res.match[1];
    client.sendMessage(question, { envelope: res.envelope });

  });
}

module.exports = Client;
