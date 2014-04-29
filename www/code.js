
var isApp = typeof cordova != 'undefined'
var buddhapongServer = 'http://buddhapong-server-env-w434ankmsv.elasticbeanstalk.com'

function addScript(src) {
    var s = document.createElement('script')
    s.setAttribute('src', src)
    document.body.appendChild(s)
}    
addScript(buddhapongServer + '/socket.io/socket.io.js')
addScript(isApp ? 'opentok.js' : 'http://static.opentok.com/webrtc/v2.2/js/opentok.min.js')

var waitCount = 0

if (isApp) {
    waitCount++
    document.addEventListener('deviceready', function () { waitCount-- })
}

waitCount++
$(function () {
    $('body').append($('<div/>').text('isApp: ' + isApp))

    waitCount--
})

function wait() {

    $('#main').text('' + waitCount + ',' + window.io + ',' + window.OT)

    if (window.TB) window.OT = window.TB
    if (waitCount == 0 && window.io && window.OT) main()
    else setTimeout(wait, 1000)
}
wait()

function main() {
    io = io.connect(buddhapongServer, { port : 80 })

    io.on('billboard', function (b) {
        $('#main').empty().append($('<pre/>').text(_.json(b, true)))
    })

    var post = {}
    post[Math.random()] = { data : 'hi there!' }
    io.emit('write', post)
}

// document.addEventListener('deviceready', function() {
//       // Getting OpenTokRTC's room's credentials. 
//       // To use your own room in opentokrtc, change cordova to room of your choice
//       //   -> ie: https://opentokrtc.com/myroom.json
//       // To use your own credentials
//       //  replace data.apiKey, data.sid, and data.token with your own 
//       var xmlhttp=new XMLHttpRequest();
//       xmlhttp.open("GET", "https://opentokrtc.com/cordova.json", false);
//       xmlhttp.send();
//       var data = JSON.parse( xmlhttp.response );

//       // Very simple OpenTok Code for group video chat
//       var publisher = TB.initPublisher(data.apiKey,'myPublisherDiv');

//       var session = TB.initSession( data.apiKey, data.sid ); 
//       session.on({
//         'streamCreated': function( event ){
//             var div = document.createElement('div');
//             div.setAttribute('id', 'stream' + event.stream.streamId);
//             document.body.appendChild(div);
//             session.subscribe( event.stream, div.id, {subscribeToAudio: false} );
//         }
//       });
//       session.connect(data.token, function(){
//         session.publish( publisher );
//       });

// }, false);
