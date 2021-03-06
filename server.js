//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
app.use(express.static('public'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/contact', function (req, res) {
  res.render('contact.html');
});

app.get('/about', function (req, res) {
  res.render('about.html');
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.get('/enviar_email', function (req, res) {
  console.log(req.query);
  //console.log('----------');
  //console.log(res);
  //res.text('ok');

  var api_key = process.env.MAILGUN_API_KEY;
  var domain = process.env.MAILGUN_DOMAIN;

  var Mailgun = require('mailgun-js')
  var mGun = new Mailgun({apiKey: api_key, domain: domain});

  var data = {
    from: 'Aluno <me@samples.mailgun.org>',
    to: process.env.MAILGUN_MEU_EMAIL,
    subject: 'Contato - ' + (new Date).toString(),
    text: 'Nome: ' + req.query.nome + "\n\n" + 'E-mail: ' + req.query.email + "\n\n" + req.query.comment
  };

  if (!db) {
    initDb(function(err){});
  }

  if(db) {
    var col = db.collection('contacts');
    col.insert({
      nome:    req.query.nome,
      email:   req.query.email,
      comment: req.query.comment
    });
  }

  //mGun.messages().send(data, function (error, body) {
  //  console.log(body);
  //  return res.send('Ok');
  //});

  mGun.messages().send(data).then(function (body) {
    console.log('body: ', body);
    res.send('Ok');
  }, function (err) {
    console.log('err: ', err);
    res.status(500).send('Something bad happened!');
  });

//  var nodemailer = require('nodemailer');
//
//  var transporte = nodemailer.createTransport({
//    service: 'Gmail',
//    auth: {
//      user: 'alucard.dxs@gmail.com',
//      pass: 'danilo@123'
//    } 
//  });
//
//  data = new Date
//  var email = {
//    from: 'alucard.dxs@gmail.com', // Quem enviou este e-mail
//    //to: 'daniloxaviergo@gmail.com', // Quem receberá
//    to: 'daniloxaviergo@gmail.com',
//    subject: 'Contato - ' + data.toString(), 
//    html: 'Nome: ' + req.query.nome + "\n\n<br/><br/>" + 'E-mail: ' + req.query.email + "\n\n<br/><br/>" + req.query.comment
//  };
//
//  transporte.sendMail(email, function(err, info){
//    if(err)
//      throw err; // Oops, algo de errado aconteceu.
//
//    res.send('ok');
//    //console.log('Email enviado! Leia as informações adicionais: ', info);
//  });
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;