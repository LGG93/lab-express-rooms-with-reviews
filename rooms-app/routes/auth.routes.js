const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

router.get("/signup", (req, res) => {
    res.render("auth/signup");
  });

  router.post("/signup", (req, res) => {
    const { email, password, username } = req.body;
   
    bcrypt
      .genSalt(saltRounds)
      .then(salt => bcrypt.hash(password, salt))
      .then(hashedPassword => {
        return User.create({
          username,
          passwordHash: hashedPassword,
          email
        });
      })
      .then(userFromDB => {
        const { username } = req.session.currentUser;
         console.log('Newly created user is: ', userFromDB);
        req.session.currentUser = userFromDB; //Here we create .currentUser
        console.log("RE SESSION",req.session.currentUser)
        res.redirect('/auth/profile');
      })
      .catch(error => console.log(error)); 
  })

  //Profile
  router.get("/profile", (req, res) => {
    //console.log('profile page', req.session);
    const { username } = req.session.currentUser;
      res.render("auth/profile");
  });
//Log in
  router.get("/login", (req, res) => {
    console.log('req session', req.session);
    res.render("auth/login");
 });

 router.post("/login", (req, res) => {
    const { email, password, username } = req.body;
    console.log("req sessiooon", req.session)

   // Check for empty fields
    if (username === '' || password === '' || email === '') {
      res.render('auth/login', {
        errorMessage: 'Please username and password to login.'
      });
      return;
    }

    User.findOne({ username })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Username is not registered.' });
        return;
      } else if (bcrypt.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;
        res.render('auth/profile', user);
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(err => console.log(err))
});

router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.redirect('/auth/login');
    });
  });
  module.exports = router;