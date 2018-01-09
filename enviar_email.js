<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>jQuery.post demo</title>
  <script src="https://code.jquery.com/jquery-1.10.2.js"></script>
</head>
<body>
 
<form action="/" id="searchForm">
  <input type="text" name="s" placeholder="Search...">
  <input type="submit" value="Search">
</form>
<!-- the result of the search will be rendered inside this div -->
<div id="result"></div>
 
<script>
// Attach a submit handler to the form
$( "#searchForm" ).submit(function( event ) {
 
  // Stop form from submitting normally
  event.preventDefault();
 
  // Get some values from elements on the page:
  var $form = $( this ),
    term = $form.find( "input[name='s']" ).val(),
    url = $form.attr( "action" );
 
  // Send the data using post
  var posting = $.post( url, { s: term } );
 
  // Put the results in a div
  posting.done(function( data ) {
    var content = $( data ).find( "#content" );
    $( "#result" ).empty().append( content );
  });
});
</script>
 
</body>
</html>


var nodemailer = require('nodemailer');

// O primeiro passo é configurar um transporte para este
// e-mail, precisamos dizer qual servidor será o encarregado
// por enviá-lo:
var transporte = nodemailer.createTransport({
  service: 'Gmail', // Como mencionei, vamos usar o Gmail
  auth: {
    user: 'usuario@gmail.com', // Basta dizer qual o nosso usuário
    pass: 'shhh!!'             // e a senha da nossa conta
  } 
});

// Após configurar o transporte chegou a hora de criar um e-mail
// para enviarmos, para isso basta criar um objeto com algumas configurações
var email = {
  from: 'usuario@gmail.com', // Quem enviou este e-mail
  to: 'alanhoffmeister@gmail.com', // Quem receberá
  subject: 'Node.js ♥ unicode',  // Um assunto bacana :-) 
  html: 'E-mail foi enviado do <strong>Node.js</strong>' // O conteúdo do e-mail
};

// Pronto, tudo em mãos, basta informar para o transporte
// que desejamos enviar este e-mail
transporte.sendMail(email, function(err, info){
  if(err)
    throw err; // Oops, algo de errado aconteceu.

  console.log('Email enviado! Leia as informações adicionais: ', info);
});