// This is just for the purpose of micmic score as a independent service
const scores = [
    { user: 'Adam', score: 250 },
    { user: 'Smith', score: 314 },
    { user: 'Bib', score: 510 },
   ];

exports.get_by_list = function(req, res) {
  res.send({
    success: true,
    data: scores,
 })
}