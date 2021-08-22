const express = require('express');
const app = express();
const port = 3000;
//Loads the handlebars module 
const handlebars = require('express-handlebars');

app.set('view engine', 'hbs');

app.engine('hbs', handlebars({ 
    layoutsDir: __dirname + '/views/layouts', extname: 'hbs' 
}));

//Server static files (we need it to import a css file) 
app.use(express.static('public'))

app.get('/', (req, res) => { 
    res.render("index", {layout: "layout"});
})

app.get('/login', (req, res) => { 
    res.render("login", {layout: "layout"});
})

app.get('/blank', (req, res) => { 
    res.render("blank", {layout: "layout"});
})

app.listen(port, () => { 
    console.log(`Example app listening at http://localhost:${port}`) 
});


