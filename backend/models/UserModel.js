const {Schema, model} = require('../connection');

const userSchema = new Schema({
  name: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() { return this.provider === "credentials"; }
  },
  image: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    default: "credentials"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('users', userSchema);