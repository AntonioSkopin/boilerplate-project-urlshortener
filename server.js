require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require("./UrlService.js");
const dns = require("dns");

// Database connection
require("./Database.js");

// URL model
const Url = require("./Url.js");

connectToDB();
app.use(express.urlencoded())
app.use(express.json())
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", async (req, res) => {
  try {
    const options = {
      // Setting family as 6 i.e. IPv6
      family: 6,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };

    dns.lookup(req.body.url, options, async (err, address, family) => {
      if (!address && !family) {
        return res.json({
          error: 'invalid url'
        });
      } else {
        if (!req.body.url.includes("https")) {
          req.body.url = "https://" + req.body.url;
        }

        const url = new Url({
          original_url: req.body.url,
          short_url: generateID()
        });

        await url.save();
        res.status(200).json({
          original_url: url.original_url,
          short_url: url.short_url
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

app.get("/:urlID", async (req, res) => {
  try {
    await Url.findOne({
      short_url: req.params.urlID
    }).then(url => {
      res.status(301).redirect(url.original_url);
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});