const express = require('express');
const app = express();
const port = 3000;
const handlebars = require('express-handlebars');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const session = require('express-session');

// MySQL Connection and test query
let mysql_connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sign_up'
})

mysql_connection.connect(error => {
    if (error) throw error;
    console.log('>> Connected to database.')
})

let test_sql = 'SELECT * FROM USER_LOGIN';
mysql_connection.query(test_sql, (error, result, fields) => {
    if (error) throw error;
    console.log(JSON.stringify(result)); //stringfy to remove RowDataPacket
});

// Configuration of view engine
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({ 
    layoutsDir: __dirname + '/views/layouts', extname: 'hbs' 
}));
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
  }));

// Middleware
app.use(express.static('public')); //Server static files
app.use(express.urlencoded({ extended: true}));  // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Parse JSON bodies (as sent by API clients)

// Session-persisted message middleware
app.use(function(req, res, next){
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
  });

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    // query the db for the given username
    var user = name; //temporary test
    //let auth_query_user = `SELECT * FROM USER_LOGIN WHERE EMAIL IS '${name}`;
    console.log('>> Checking if user exists in the database');
    if (!user) {
        console.log('>> User not found');
        return fn(new Error('cannot find user'));
    }
    
    // check password
    var user_password = "$2b$10$OpXeOVJ69r0b3cz.YWP31.osX4L4i.wLeqjj/uQXEdi.LMwQxfPge" //temporary test
    bcrypt.compare(pass, user_password, function (err, result) { 
        if (result == true) {
            console.log('>> Valid password'); 
            return fn(null, user)
        } else {
            console.log('>> Invalid password'); 
            return fn(err) 
        } 
    });
}

function restrict(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.session.error = 'Access denied!';
      res.redirect('/login');
    }
  }

app.get('/', (req, res) => { 
    res.render("index", {layout: "layout"});
})

app.get('/login', (req, res) => { 
    res.render("login", {layout: "layout"});
})

app.get('/session', (req, res) => { 
    res.render("session", {layout: "layout"});
})

app.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
      res.redirect('/login');
    });
  });

// Register new user
app.post('/register', (req, res) => { 
    console.log(req.body);
    let hashed_password = bcrypt.hashSync(req.body.password, 10);

    console.log(hashed_password);

    let query_ulogin = `INSERT INTO user_login (EMAIL, PWORD) VALUES ('${req.body.email}', '${hashed_password}')`;
    mysql_connection.query(query_ulogin, (error, result) => {
        if (error) throw error;
        console.log(JSON.stringify(result)); //stringfy to remove RowDataPacket
    });

    let query_uinfo = `INSERT INTO user_info (EMAIL, FNAME, LNAME) VALUES ('${req.body.email}', '${req.body.first_name}', '${req.body.last_name}')`;
    mysql_connection.query(query_uinfo, (error, result) => {
        if (error) throw error;
        console.log(JSON.stringify(result)); //stringfy to remove RowDataPacket
    });
    res.render("login", {layout: "layout"});
})

// Login existing user
app.post('/login', function(req, res){
    authenticate(req.body.email, req.body.password, function(err, user){
      if (user) {
        // Regenerate session when signing in
        // to prevent fixation
        req.session.regenerate(function(){
          // Store the user's primary key
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.session.user = user;
          req.session.success = 'Authenticated as ' + user.name
            + ' click to <a href="/logout">logout</a>. '
            + ' You may now access <a href="/restricted">/restricted</a>.';
          res.redirect('/session');
        });
      } else {
        req.session.error = 'Authentication failed, please check your '
          + ' username and password.'
          + ' (use "tj" and "foobar")';
        res.redirect('/login');
      }
    });
  });



app.listen(port, () => { 
    console.log(`Example app listening at http://localhost:${port}`) 
});
