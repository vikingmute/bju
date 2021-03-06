var user = require('../models/user').User;
var express = require('express');
var crypto = require('crypto');
var router = express.Router();

function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}
router.route('/restore')
			.get(function(req, res) {
				var sess = req.session;
				if (req.cookies.cid) {
					var cid = req.cookies.cid;
					var username = req.cookies.uname;
					if (cid === sess.token) {
						user.getInfo(username, function(data) {
							res.json(data);
						});
					} else {
						res.status(401).json({'error': 'wrong cid provide'});
					}
				} else {
					res.status(401).json({'error': 'no cid provide'});
				}
			});
router.route('/users')
      .get(function(req, res) {
				user.find({}, function(err, data) {
					if (!err) {
						data.forEach(function(user) {
							user.avatarUrl = "http://www.gravatar.com/avatar/" + md5(user.avatar) + "?s=70&d=retro";
						});
						res.json(data);
					} else {
						res.status(401).json(err);
					}
				});
      })
      .post(function(req, res) {
        var data = req.body;
        user.create(data, function(data) {
          res.json(data);
        });
      });
router.route('/login')
      .post(function(req, res) {
        var data = req.body;
				var sess = req.session;
				var username = data.username;
        user.login(username, md5(data.password + ''), function(data) {
					if (data.status === 'success') {
						//generate the token
						var token = crypto.randomBytes(64).toString('hex');
						//save the token to server session
						sess.token = token;
						data.token = token;
						res.cookie('cid', token, {maxAge: 900000});
						res.cookie('uname', username, {maxAge: 900000});
	          res.json(data);
					} else {
						res.status(401).json(data);
					}

        })
      });
router.route('/logout')
			.post(function(req, res) {
				var data = req.body;
				var sess = req.session;
				if (data.token === sess.token) {
					//clear the session
					delete sess.token;
					//clear the cookie
					res.clearCookie('cid');
					res.clearCookie('uname');
					res.status(200).json({'msg': 'logout'});
				} else {
					res.status(401).json({'msg': 'invalid token'});
				}
			});
router.route('/checkuser/:name')
			.get(function(req, res) {
				var name = req.params.name;
				user.check(name, function(data){
					res.json(data);
				});
			});
router.route('/user/:name')
      .get(function(req, res) {
        var name = req.params.name;
				var authorization = req.headers['authorization'];
				var sess = req.session;
				switch (authorization) {
					default:
						return res.status(401).end('Please login to access this page');
					case 'Token token=expired':
						return res.status(401).end('Your token is expired');
					case 'Token token=' + sess.token:
						user.getInfo(name, function(data) {
		          res.json(data);
		        });
				};

      })
			.put(function(req, res) {
				var id = req.params.name;
				var postData = req.body;
				user.update(id, postData, function(data) {
					res.json(data);
				});
			})
      .delete(function(req, res) {
        var id = req.params.name;
        user.delete(id, function(data) {
          res.json(data);
        })
      });

module.exports = router;
