const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  hasUserWithUserName(db, username) {
    return db('recipro_users')
      .where({ username })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('recipro_users')
      .returning('*')
      .then(([user]) => user)
  },
  validatePassword(username, password) {
    if (password.length < 8) {
      return "password must be at least 8 characters";
    }
    if (password.length > 72) {
      return "password must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "password must not start or end with empty spaces";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "password must contain one upper case, lower case, symbol, and number";
    }
    if (password === username) {
      return "username may not be used as password";
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
    }
  },
}

module.exports = UsersService
