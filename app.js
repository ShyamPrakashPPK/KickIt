const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const hbs = require('express-handlebars');
const app = express();
const fileUpload = require('express-fileupload');
const db = require('./config/connections')
const session = require('express-session')
const nocache = require("nocache");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials',
  helpers: {
    isEqual: (status, value, options) => {
      if (status == value) {
        return options.fn(this)
      }
      return options.inverse(this)
    },
    inc: (value, options)=>{
      return parseInt(value) + 1;
    }
  }
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({ secret: "Key", resave: true, saveUninitialized: true, cookie: { maxAge: 600000 } }))
app.use(nocache());

db.connect((err) => {
  if (err) console.log("Failed to connect to database⛔⛔");
  else console.log("Database Connection Sucessful✅✅");

})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
