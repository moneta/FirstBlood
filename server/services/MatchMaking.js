const amqp = require('amqplib/callback_api');
const axios = require('axios');
const Qs = require('qs');

const responseQueue = 'response_matchmaking';
const requestQueue = 'request_matchmaking';

var responseChannel;
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue(responseQueue, { durable: false });
    
    responseChannel = ch;
  });
});

function getShortList() {
  // Ignore the authentication for now

  // Send request to the login service
  return axios({
    method:'GET',
    url:'http://localhost:8080/api/login/getshortlist',
  })
    .then((json) => {
      return {
        success: true,
        data: json.data
      };
    })
    .catch(e => {
      console.log('something went wrong: ', e.toString());
      return {
        success: false,
        errorMsg: e.toString(),
      }
    }); 
}

function getScoreByList(userList) {
  // Ignore the authentication for now

  // Send request to the score service
  return axios({
    method:'get',
    url:'http://localhost:8080/api/score/list/:list',
    params: {
      list: [1, 2],
    },
    paramsSerializer: function(params) {
      return Qs.stringify(params, { encode: false } /*{ arrayFormat: 'brackets' }*/)
    },
  })
    .then((json) => {
      return {
        success: true,
        data: json.data
      };
    })
    .catch(e => {
      console.log('something went wrong: ', e.toString());
      return {
        success: false,
        errorMsg: e.toString(),
      }
    });
}

function dispatch(msg) {
  responseChannel.sendToQueue(responseQueue, new Buffer(msg));
}

async function handler(msg) {
  // Process the request
  console.log(" [x] Received %s", JSON.parse(Object.keys(msg)));

  // Call the login service to get a short list
  const shortList =  await getShortList();
  console.log(" [x] short list: ", shortList);

  // Call the scoring service with the received short list
  const scores = await getScoreByList(shortList);
  console.log('scores: ', scores);
  
  // Run the matchmaking
  
  // Dispatch result
  dispatch(msg.content.toString());
}

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue(requestQueue, { durable: false });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", requestQueue);
    ch.consume(requestQueue, handler, { noAck: true });
  });
});