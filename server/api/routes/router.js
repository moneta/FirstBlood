'use strict';

module.exports = function(router) {
  const controller = require('../controllers/common');
  const loginService = require('../controllers/loginService');
  const scoreService = require('../controllers/scoreService');

  router.route('/login/authenticate')
    .post(loginService.authenticate);

  router.route('/login/getshortlist')
    .get(loginService.get_short_list);  

  router.route('/find/user/:userId')
    .get(controller.get_matches);

    router.route('/score/list/:list')
    .get(scoreService.get_by_list);  

  return router;
};
