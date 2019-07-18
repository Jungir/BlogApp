const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

let DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog_app';
mongoose.connect(DATABASE_URL, {useNewUrlParser: true,
    useCreateIndex: true}).then(()=>{
        console.log('connected to Db');
    }).catch (err => {console.log('message', err.message);
});

mongoose.set('useFindAndModify', false);

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// to serve custom CSS 
app.use(express.static('public'));

app.use (bodyParser.urlencoded({extended:true}));
//comes after body parser
app.use(expressSanitizer());

// mongoose schema
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    // image: {type: String, default: "placeholder.img"},
    body: String,
    date: {type: Date, default: Date.now}
})
// mongoose model
const blogDocModel = mongoose.model('collectionBlog', blogSchema);



// blogDocModel.create({
//     title: 'test Blog',
//     image: 'https://www.bing.com/images/search?view=detailV2&ccid=MdtIUp1T&id=FE62C671E117964FF963654F5071D975CEA86C70&thid=OIP.MdtIUp1TARMhP64wLOWxQgHaHa&mediaurl=https%3a%2f%2fi2.wp.com%2folodonation.com%2fwp-content%2fuploads%2f2017%2f06%2fblog.jpg&exph=693&expw=693&q=blog+img&simid=608027068620213989&selectedIndex=1',
//     body: 'This is my very first blog'
// }, function (err, data) {
//     if(err){
//         console.log(err);
//     }else{
//     console.log(data);
//     }
// });

//RESTFUL ROUTES
app.get('/', function(req,res){
    res.redirect('/blogs');
});

app.get('/blogs', function (req, res) {
    blogDocModel.find({}, function (err, data) {
        if (err){
            console.log(err);
        }else {
            res.render('index', {blogs: data});
        }
    })
    
});
app.get('/new', function (req, res) {
    res.render('new');
})
//create Route
app.post('/blogs', function (req, res) {
    //create blog
   const sanitizedString = req.sanitize(req.body.blog.body);
   
   const obj = {
        title: req.body.blog.title,
        image: req.body.blog.image,
        body: sanitizedString
   }
    blogDocModel.create(obj, function (err, newBlog) {
        if(err){
            console.log(err);
            
        }else {
            res.redirect('/blogs');
        }
    })
    // redirect to index
})

// SHOW 
app.get('/blogs/:id', function (req, res) {
    let id = req.params.id;
    blogDocModel.findById(id, function (err, foundBlog) {
        if(err){
            res.redirect('/blogs');
        }else{
            res.render('show', {blog: foundBlog})
        }
        
    })
})
//edit form
app.get('/blogs/:id/edit', function (req, res){
    let id = req.params.id;
    blogDocModel.findById(id, function (err, foundBlog) {
        if(err){
            res.redirect('/blogs');
        }else{
            res.render('edit', {blog: foundBlog})
        }
        
    })
    
  })
//update
app.put('/blogs/:id', function (req,res) {
    const editBody = req.sanitize(req.body.blog.body);
    const objEdited = {
         title: req.body.blog.title,
         image: req.body.blog.image,
         body: editBody
    }
    blogDocModel.findByIdAndUpdate(req.params.id, objEdited, function (err, updatedBlog) {
        if(err){
            res.redirect('/blogs');
        }else {
            res.redirect('/blogs/'+ req.params.id);
        }
    })
})
// delete route
app.delete('/blogs/:id', function (req, res) {
    let id = req.params.id;
    //destroy blog and redirect
    blogDocModel.findByIdAndRemove(id, function (err) {
       if(err){
            res.redirect("/blogs");
       }else{
            res.redirect("/blogs");
       }
    });
    
})

const port = process.env.PORT || 3000;
const ip = process.env.IP || "127.0.0.1";
app.listen(port,function(){
    console.log("Server has started .... at port "+ port+" ip: "+ip);
});