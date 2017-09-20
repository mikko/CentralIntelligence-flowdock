require('dotenv').config();
const _ = require('lodash');
const CIClient = require('ci-client');
const CIconfig = require('../client-config.js');
const client = new CIClient(CIconfig);

const commandPrefix = '.';

const userParser = ctx => ctx.envelope.user.id;

client.setUserParser(userParser);
client.setPrivateChatParser(ctx => ctx.envelope.room === undefined);

client.setUserPropertiesParser(ctx => ({
  flowdockUsername: ctx.envelope.user.name,
  flowdockId: ctx.envelope.user.id
}));

const updateGroupUsers = (robot) => {
  robot.adapter.flows.forEach(flow => {
    const users = flow.users.reduce((memo, user) => {
      memo[user.id] = user;
      return memo;
    }, {});
    const flowName = flow.parameterized_name;
    client.sendCommand('setGroupUsers', { group: flowName, type: 'flowdock', users: users });
  });
};

function Client(robot) {
  // Stupid way to sync just in start and with a timeout
  setTimeout(() => {
    updateGroupUsers(robot);
  }, 5000);

  client.setReceiver((action, message, context) => robot.send(context.envelope, message));

  robot.respond(/(.*)/i, (res) => {
    const message = res.match[1];
    const context = { envelope: res.envelope };

    if (message[0] === commandPrefix) {
      const msgTokens = message.split(' ');
      const command = msgTokens.shift().split(commandPrefix).pop();
      const params = msgTokens.join(" ");
      client.sendCommand(command, params, context);
    } else {
      client.sendMessage(message, context);
    }
  });
}

module.exports = Client;
