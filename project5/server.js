// import libraries
const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const nedb = require('@seald-io/nedb');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const nedbSessionStore = require('nedb-promises-session-store');
const bcrypt = require('bcryptjs');

// setting app
const app = express();

// set up multer for handling image uploads
const upload = multer({ dest: 'public/uploads/' });

// global middleware setup
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// session configuration using NeDB session store
const sessionStore = nedbSessionStore({
  connect: expressSession,
  filename: 'sessions.txt'
});
app.use(expressSession({
  store: sessionStore,
  secret: 'supersecret123',
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 } // 1 year
}));

// database instances
const usersDB = new nedb({ filename: 'users.txt', autoload: true });
const flowersDB = new nedb({ filename: 'flowers.txt', autoload: true });

// middleware to enforce authentication
function requiresAuthentication(req, res, next) {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect('/login?err=notLoggedIn');
  }
}

// landing page
app.get('/', (req, res) => {
  res.render('landing');
});

// login routes
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  usersDB.findOne({ username }, (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.redirect('/login');
    }
    req.session.loggedInUser = username;
    res.redirect('/garden');
  });
});

// signup routes
app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  usersDB.findOne({ username }, (err, existingUser) => {
    if (existingUser) return res.send('Username taken.');
    const hashed = bcrypt.hashSync(password, 10);
    usersDB.insert({ username, password: hashed }, () => res.redirect('/login'));
  });
});

// logout route
app.get('/logout', (req, res) => {
  delete req.session.loggedInUser;
  res.redirect('/login');
});

// Main garden page displaying user's flowers
app.get('/garden', requiresAuthentication, (req, res) => {
  flowersDB.find({ ownerUsername: req.session.loggedInUser }, (err, flowers) => {
    res.render('garden', { flowers });
  });
});

// Route to create a new flower
app.get('/create', requiresAuthentication, (req, res) => {
  res.render('create', { flower: null });
});

// Route to edit an existing flower
app.get('/edit', requiresAuthentication, (req, res) => {
  const id = req.query.id;
  flowersDB.findOne({ _id: id }, (err, flower) => {
    if (!flower) return res.send("Flower not found.");
    if (flower.ownerUsername !== req.session.loggedInUser) return res.send("Access denied.");
    res.render('create', { flower });
  });
});

// handle saving of new or updated flower
app.post('/saveFlower', requiresAuthentication, upload.single('flowerImage'), (req, res) => {
  const {
    id, title, description, petalCount, petalColor,
    centerColor, shape
  } = req.body;

  flowersDB.findOne({ _id: id }, (err, existingFlower) => {
    let imagePath = req.file ? `/uploads/${req.file.filename}` : (existingFlower ? existingFlower.imagePath : null);
    const flowerData = {
      title,
      description,
      petalCount: parseInt(petalCount),
      petalColor,
      centerColor,
      shape,
      imagePath,
      ownerUsername: req.session.loggedInUser,
      timestamp: existingFlower ? existingFlower.timestamp : Date.now() // keep original timestamp if editing
    };

    if (id) {
      flowersDB.update({ _id: id }, { $set: flowerData }, {}, () => {
        res.redirect('/garden');
      });
    } else {
      flowersDB.insert(flowerData, () => {
        res.redirect('/garden');
      });
    }
  });
});

// view detailed flower page
app.get('/view', requiresAuthentication, (req, res) => {
  const id = req.query.id;
  flowersDB.findOne({ _id: id }, (err, flower) => {
    if (!flower) return res.send("Not found");
    const formattedTime = new Date(flower.timestamp).toLocaleString();
    res.render('view', { flower, formattedTime });
  });
});

// delete flower route
app.post('/deleteFlower', requiresAuthentication, (req, res) => {
  const id = req.body.id;
  flowersDB.remove({ _id: id, ownerUsername: req.session.loggedInUser }, {}, (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.redirect('/garden');
  });
});

// start server
app.listen(3000, ()=>{
  console.log('http://127.0.0.1:3000')
})
