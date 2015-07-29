var collection = require('../models/collection').Collection;
var express = require('express');
var router = express.Router();

router.route('/collections')
      .get(function(req, res) {
        //res.json({msg: 'this is good'});
        collection.find({}, function(data) {
          res.json(data);
        });
      })
      .post(function(req, res) {
        var postData = req.params;
        collection.create(postData, function(data) {
          res.json(data);
        })
      });

router.route('/collection/:id')
      .get(function(req, res) {
        var id = req.params.id;
        collection.findOne(id, function(data) {
          res.json(data);
        });
      })
      .put(function(req, res) {

      })
      .delete(function(req, res) {
        var id = req.params.id;
        collection.delete(id, function(data) {
          res.json(data);
        });
      });

module.exports = router;
