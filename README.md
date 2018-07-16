Get Started!

Preconditions:
1. Download and install RabbitMQ
    Refer to: https://www.rabbitmq.com/download.html
    on MacOS:
      - # brew update
      - # brew install rabbitmq
    
    Run RabbitMQ Server:
      - Add PATH=$PATH:/usr/local/sbin to your .bash_profile or .profile.
      - # rabbitmq-server

2. Download and install MySQL
    Refer to: https://dev.mysql.com/downloads/mysql/
          

Installation:

1. Clone the project

2. Install the node server
   - # cd /YOUR_FOLDER_PATH/firstblood/server
   - # npm install

3. Install and build the web UI
  - # cd ..
  - # npm install
  - # npm run build

4. Run the server
  - # cd server
  - # node server

5. Run the MatchMaking service
  - # cd  services
  - # node MatchMaking.js

Open your browser at: http://localhost:8080index.html

------------------------------------------------------
I. Ideas to design my simple MMR system:

- When the new game is first introduced, no one has any skills for that game: skill level is minimum. Let’s give MIN = 0.

- A very few talented players become the experts eventually. They know everything and their skill level approaching the maximum level. Let’s give MAX = 800.

- In order to find players with similar skills, we can split the player's scores into different categories or levels. Let’s split the score range [0 - 800] into 8 levels as follows:
  - Level 0: 0 - 250
  - Level 1: 251 - 450
  - Level 2: 451 - 600
  - Level 3: 601 - 700
  - Level 4: 701- 750
  - Level 5: 751 - 775
  - Level 6: 776 - 788
  - Level 7: 789 - 800
    (Note: there should be better distribution to split the score range into different levels. This one just roughly mimics the 80/20 law.

- The simplest rule to rank a player is to increase skill score by 1 for every game he wins and decrease by 1 for his lost game. Everybody starts with score = 0.

- With this simple design, in order to reach the highest level any user must play at least 800 games, which is not good. Some players are born faster than the others. They join the game later but very soon after that they can win the other players with the much higher levels than they are. To reflect this, let's add the opponent's level factor into the gained/lost scores after every game.

- So let's assume that if a player at a lower level, say level 1, plays and wins 10 games against different players with higher level, say level 3, then that player's level should be able to reasonably jump from 1 to 3 after just that 10 games. The loser should also be demoted to lower level if he lost just 10 games to the lower level opponents.

- On the other hands, as the player at the lower level is expected to lost a game against the higer level player, so his score's just decrease by 1 for every lost game. Similarly, the winner's score is also just increased by 1 in this case.

The rule can be modified as follows:
  + If a player wins an opponent with a higher level:
    > Increase winner's score by (opponent's score - player's score) / 10 for every game he wins, if score is still < MAX
    > Decrease loser's score by the same amount, if the score is still > MIN
  + If a player lost to an opponent with a higher or equal level:
    > Increase winner's score by 1 for every game he wins, if score is still < MAX
    > Decrease loser's score by the same amount, if score is still > MIN

- Now if a player stops playing this game for a long time, say 10 years, then it is safe to assume that his skills are lost significantly. So the score can be adjusted as follows:
  > timeFactor = max(1 - (currentTimestamp - latestTimestamp) / 10 years, 0)
  > adjusted score =  timeFactor * current score
  - latestTimestamp: a timestamp of a user's latest game


II. General Architecture 

- The system can be designed applying the monolithic or micro-service architecture. It can also be implemented in such a way that it is monolithic at the begining in order to speed up a time to market, and easily to migrate gradually to the micro-service architecture when the app growths in the size and complexity later on.

- Belows are some esential services designed with that concept in mind.

1. Register service:

 This service allows a new user to sign up, stores and provides player’s info and credentials, which is scalable up to 1 millions users.


2. Scoring (MMR) service:

  This service provides users' scores and keeps them up-to-date based on the results from the games that users played.


3. Login service:

  This service authenticates users and maintains a list of currently active users. This list can grow up to few ten thousands concurrent user or shrinks down to just a few users.

  This service also keeps user's status such as: idle or engaged (in a game)

  To improve the performance the matchmaking service does not need to run against the whole 1 million registered users, but just the set of active users.


4. Matchmaking service:

  This service provides a short list of users with similar skill(same same score) as well as a certain numbers of users with higher skill levels in case a low skill level user want to challenge the higher ranking users to advance his ranking faster.

  To improve the response time, this service will do 2 steps:

  1. Call the login service to get a short list of a certain number of active users, for example the most recently logged in 500 users (There could be 10K users active at that time)

  2. Call scoring service with this 500-user list to get all the scores. 

  3. Run the matchmaking algorithm to generate and return the player-matched list. Here is one example

------------------------
Player-matched short list
   - Same skill level players: maximum 50 players  with the same skill level with the current player.
   - Higher ranking players: maximum 10 users for each higher level.
------------------------

  If the current player is not happy with the matched list, he can request for a re-match. The same algorithm is now run with increasing rematch count and produce another result.


5. Gaming services:

  This service allows a user to start a game, play with each other and store the results.

  This service uses the matchmaking service to search for the players.

  When players start a game, this service will call the login service to update statuses of the engaged players, then stores and keeps track of the game progress.

  When the games finish this service and call the scoring service to update users' scores with the game outcomes. And call the login service to update the players' statuses to Idle.

III. Design matchmaking service for 1 million users.

+ If the service access is coming from outside network,
   - Use NodeJS with REST API to provide service.
   - Scale up the service by increasing the number of nodes providing REST API.
   - Use load balancer to distribute the request to these nodes. If the current infrastructure is hosted on AWS then we can use Elastic Load Balancer. For in-house premises hosting, we can use Nginx load balancing.

+ If this is internal service, which means it is just called by other services that are fully under our control:
    - Use the RPC message queue, such as RabbitMQ, to receive the requests and make use of the hash exchange supported by RabbitMQ to load balance the requests.
    - The nodes will play a worker role and consume messages from these queues . By just adding the new queue and workers, the system can be expanded to serve up to millions of request per seconds.
    - There are request and response queues. The other services will send requests to the request queue and get results from response queue.
