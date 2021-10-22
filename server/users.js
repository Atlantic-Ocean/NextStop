const db = require('../db/index.js');
// const session = require("express-session");
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');

module.exports = {
  addUser: (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password,saltRounds, (err, hash) => {

      if (err) {
        console.log(err)
      }

      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)", 
        [username, hash],
        (err, result) => {
            if (err) {
                res.status(404).send(err);
            } else {
                res.status(200).send(result);
            }
      });
    });
  },
  getUser: (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
      "SELECT * FROM users WHERE username = ?;",
      username,
      (err, result) => {
        if (err) {
          res.send({err: err});
        }

        if (result.length > 0) {
          bcrypt.compare(password, result[0].password, (error, response) => {
            if (response) {
              const id = result[0].id;
              const token = jwt.sign({id}, "jwtSecret", {
                expiresIn: 300,
              })

              req.session.user = result;
              
              res.json({auth:true, token: token, result: result});
            } else {
              res.json({ auth: false, message: "Wrong username/password combination" });
            }
          })
        } else {
          res.json({ auth: false, message: "User doesn't exist" });
        }
      }
    )
  },
  getLogin: (req, res) => {
    if (req.session.user) {
      res.send({ loggedIn: true, user: req.session.user });
    } else {
      res.send({ loggedIn: false });
    }
  },
  isUserAuth: (req, res) => {
    res.send("The user has been authenticated!");
  }
}