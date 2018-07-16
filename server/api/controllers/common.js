var amqp = require('amqplib/callback_api');

const responseQueue = 'response_matchmaking';
const requestQueue = 'request_matchmaking';

exports.get_matches = function(req, res) { 
  // This is to micmic the real environment. The web service receives
  // the http request to search for similar skill players and
  // send messge to the queue of the matchmaking service
  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.assertQueue(requestQueue, { durable: false });
      
      console.log(" [x] Sent request for user id = ", req.params.userId);
      ch.sendToQueue(requestQueue, Buffer.from(JSON.stringify({
        userId: req.params.userId,
      })));

      setTimeout(function() {
        conn.close();

        // Waiting for the result to return from response queue
        amqp.connect('amqp://localhost', function(err, conn) {
          conn.createChannel(function(err, ch) {
            ch.assertQueue(responseQueue, { durable: false });
            console.log(" [common] Waiting for messages in %s. To exit press CTRL+C", responseQueue);
            ch.consume(responseQueue, function(msg) {
              // console.log(" [common] Received %s", msg.content);
              res.send({});
              conn.close();
            }, { noAck: true });
          });
        });
      }, 500);
    });
  });
};
