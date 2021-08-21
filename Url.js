const mongoose = require("mongoose");

const UrlSchema = mongoose.Schema({
  original_url: { type: String },
  short_url: { type: String }
});

const Url = mongoose.model("urls", UrlSchema);
module.exports = Url;