// This is just for the purpose of micmic login as a independent service
const activeUsers = [
  { user: 'Adam', statuc: 'idle', lastActive: 1531505989443 },
  { user: 'Smith', statuc: 'idle', lastActive: 1531505949443 },
  { user: 'Bib', statuc: 'idle', lastActive: 1531502949443 },
  { user: 'Alice', statuc: 'engaged', lastActive: 1531505949443 },
 ];

exports.authenticate = function(req, res) {
  res.send({
    success: true,
    data: {
      userId: 1,  
      name: req.body.user,
      currentScore: 368,
      level: 1,
    },
  });
};
  
/**
 * Return the short list of the latest 500 logged-on users
 */
exports.get_short_list = function(req, res) {
  // Query its own database to get the active user lists
  console.log('Query database to get the sortlist');

  res.send({
    success: true,
    activeUsers,
  });
};