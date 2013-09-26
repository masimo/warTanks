  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // if browser doesn't support WebSocket, just show some notification and exit
  if (!window.WebSocket) {
    console.log('Sory doesnt work');

  };

  // open connection
  var connection = new WebSocket('ws://127.0.0.1:1337');



  connection.onmessage = function(message) {

    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data);
      return;
    }

    if (json.type === 'action') { // it's a single message

      console.log(json.data);
      console.timeEnd('Your ping: ')

      //objCollection = json.data;

    } else if (json.type === 'client') { // it's a single message

      console.log(json.data);

      //objCollection.clients = json.data;

    } else {
      console.log('Hmm..., I\'ve never seen JSON like this: ', json);
    }



  };

  function sendMsg() {
    console.time('Your ping: ')
    connection.send('Ping');


  }

  //sendMsg();