var mongo = require("mongodb").MongoClient,
    express = require("express"),
    path = require("path"),
    isValidURL = require("valid-url").isWebUri

var app = express(),
    uri = process.env.MONGOLAB_URI,
    url = uri || `mongodb://${process.env.IP}:27017/url-shortener`

app.set('views', __dirname)
app.set('view engine', 'jade')

mongo.connect(url, function(err, db) {
  if (err) throw err

  console.log("Connected to MongoDB!")

  var urls = db.collection("urls")

  urls.createIndexes(
    [
      {key: {original_url: 1}, unique: true},
      {key: {sequence_id: -1}, unique: true}
    ],

    function(err, result) {
      if (err) throw err
      console.log("Indices created/verified.")

    var sequenceID = 0

    app.get("/new/:url(*)", validateURL, alreadyExists, function(req, res) {
      var originalURL = req.params.url

      urls.find().sort({sequence_id: -1}).limit(1).next(function(err, doc) {
        if (err) throw err

        if (doc && doc.sequence_id >= 0)
          sequenceID = doc.sequence_id + 1
          urls.insertOne({
            original_url: originalURL,
            sequence_id: sequenceID
          }, function(err, result) {

            if (err) throw err

            var shortURL = idToUrl(sequenceID, req)
            var jsonResp = urlJSON(original, short)

            res.json(jsonResp)
          })
        })
      })

      app.get("/:urlKey", function (req, res) {
        var urlKey = req.params.urlKey
        var cursor = urls.find({sequence_id: parseInt(urlKey, 36)}).limit(1)

        cursor.hasNext(function(err, exists) {
          if (err) throw err

          if (exists) {
            cursor.next(function(err, doc) {
              if (err) throw err
              res.redirect(doc.original_url)
            })
          } else {
              res.status(404).json({
                error: "No URL associated with this key."
              })
            }
          })
      })

      app.get("*", function(req, res) {
          res.render("index")
      })

      var server = app.listen(process.env.PORT || 8080, function() {
        console.log('Server listening on port ${server.address().port')
      })
    })

  function validateURL(req, res, next) {
    var url = req.params.url

    if (!isValidURL(url))
      return res.status(422).json({
        error: "Format of provided URL is invalid. Remember http:// or https://"
        provided_url: url
      })
      next()
  }

  function alreadyExists(req, res, next) {
    var cursor = urls.find({original_url: req.params.url}).limit(1)

    cursor.hasNext(function(err, doc) {
      if (err) throw err
      if (exists) {
        var shortURL = idToUrl(doc.sequence_id, req)
        var jsonResp = urlJSON(doc.original_url, short)

        res.json(jsonResp)
      } else {
        next()
      }
    })
  }

  function urlJSON(originalURL, shortURL) {
    return {
      original_url: originalURL
      short_url: shortURL
    }
  }

  function idToUrl(id, req) {
    return `${req.protocol}://${req.hostname}/${id.toString(36)}`
  }

  function keyToId(key) { return parseInt(key, 36)
})