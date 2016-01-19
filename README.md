# lBXKqpLHr0yWFRBEVqMQSw

### Description

- Ubuntu 14.04

- NodeJs (v4.2.1)

- Full fill the goal requirement as much as I can

- The consumer should be able to deploy Scale horizontally

- Using co + bluebird

- Apply the code to eslint-config-aftership

- Follow aftership coding documentation as much as I can

- Include unit test, mainly for consumer work part

### How it work?

- Install grunt

  `npm install -g grunt-cli`

- Install modules

  `npm install`

- Test, include eslint checking (`grunt lint`) and unit test (`grunt test`)

  `npm test`

- Change config if needed (Go to the 'bin' folder and modify config.js)

- Run the producer (Go to the 'bin' folder and run the command)

  `node producer.js`

- Run the consumer (Go to the 'bin' folder and run the command)

  `node consumer.js`
