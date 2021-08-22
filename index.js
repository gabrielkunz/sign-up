const express = require('express');
const app = express();
const port = 3000;
//Loads the handlebars module 
const handlebars = require('express-handlebars');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
//Connect
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

//INSERT INTO `user_login` (`EMAIL`, `PWORD`) VALUES ('req.body.email', 'req.body.password');
//INSERT INTO `user_info` (`EMAIL`, `FNAME`, `LNAME`) VALUES (''req.body.email', req.body.first_name', 'req.body.password');

app.set('view engine', 'hbs');

app.engine('hbs', handlebars({ 
    layoutsDir: __dirname + '/views/layouts', extname: 'hbs' 
}));

//Server static files (we need it to import a css file) 
app.use(express.static('public'))

// Parse URL-encoded bodies (as sent by HTML forms) 
app.use(express.urlencoded());  
// Parse JSON bodies (as sent by API clients) 
app.use(express.json());

app.get('/', (req, res) => { 
    res.render("index", {layout: "layout"});
})

app.get('/login', (req, res) => { 
    res.render("login", {layout: "layout"});
})

app.post('/login', (req, res) => { 
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

app.get('/blank', (req, res) => { 
    res.render("blank", {layout: "layout"});
})

app.listen(port, () => { 
    console.log(`Example app listening at http://localhost:${port}`) 
});
