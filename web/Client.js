var test1 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var test2 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var test3 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var test4 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var testCase = test1.concat(test2)

// the URL of the WAMP Router (Crossbar.io)
 //
 var wsuri;
 if (document.location.origin == "file://") {
    wsuri = "ws://127.0.0.1:8080/ws";

 } else {
    wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
                document.location.host + "/ws";
 }


 // the WAMP connection to the Router
 //
 var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
 });

 var test = function test (args){

    console.log("function test called with args: " +args)
    return "worked"
 }

 var sort = function sort(args){
    console.log("Sorting list of size: "+args.length)
    var result = mergeSort(args)
    console.log("sort finished.")
    return result;
 }


 function mergeSort(arr)
 {
     if (arr.length < 2)
         return arr;
    
     var middle = parseInt(arr.length / 2);
     var left   = arr.slice(0, middle);
     var right  = arr.slice(middle, arr.length);
  
     return merge(mergeSort(left), mergeSort(right));
 }
  
 function merge(left, right)
 {
     var result = [];
  
     while (left.length && right.length) {
         if (left[0] <= right[0]) {
             result.push(left.shift());
         } else {
             result.push(right.shift());
         }
     }
  
     while (left.length)
         result.push(left.shift());
  
     while (right.length)
         result.push(right.shift());
  
     return result;
 }

 // timers
 //
 var t1, t2;

var sesh;

var sortCall;


 // fired when connection is established and session attached
 //
 connection.onopen = function (session, details) {


   sortCall = function () {
            session.call("com.myapp.distributeSort", [1,2,4,1,5,1,5,1,6,6],
                function(res){
                    console.log(res)
                },
                function (err){
                    console.log("error calling sort on server"+err)
                }
            )
    }



    console.log("Connected");
    sesh = session;
    // console.log("anything else???")
    // console.log("sesson: "+session)
    // for (i in details){
    //     console.log("deets: "+i + "  =  "+details[i])
    // }

    // for (i in session){
    //     console.log("sesh: "+i +"  = "+session[i])
    // }

    // console.log("details: "+details)

    session.register('com.myapp.sort'+session.id, sort)

    session.register('com.myapp.test', test).then(
       function(reg){
          console.log("registered test")
       },
       function (err){
          console.log("failed to register test" + err)
       }
    )

    // setInterval(function(){ session.call("com.myapp.distributeSort", [1,2,4,1,5,1,5,1,6,6])},1000)

    // document.getElementById('content').innerHTML = "<input type='button' onclick='console.log(\"asdf\")' value='this is a button'></input>"

 };

document.getElementById('content').innerHTML = "<input type='button' onclick='sesh.call(\"com.myapp.distributeSort\",testCase)' value='Distribute Sort'></input>"

 // fired when connection was lost (or could not be established)
 //
 connection.onclose = function (reason, details) {
    console.log("Connection lost: " + reason);
    if (t1) {
       clearInterval(t1);
       t1 = null;
    }
    if (t2) {
       clearInterval(t2);
       t2 = null;
    }
 }


 // now actually open the connection
 //
 connection.open();


















    // // SUBSCRIBE to a topic and receive events
    // //
    // function on_counter (args) {
    //    var counter = args[0];
    //    console.log("on_counter() event received with counter " + counter);
    // }
    // session.subscribe('com.example.oncounter', on_counter).then(
    //    function (sub) {
    //       console.log('subscribed to topic');
    //    },
    //    function (err) {
    //       console.log('failed to subscribe to topic', err);
    //    }
    // );


    // // PUBLISH an event every second
    // //
    // t1 = setInterval(function () {

    //    session.publish('com.example.onhello', ['Hello from JavaScript (browser)']);
    //    console.log("published to topic 'com.example.onhello'");
    // }, 1000);


    // // REGISTER a procedure for remote calling
    // //
    // function mul2 (args) {
    //    var x = args[0];
    //    var y = args[1];
    //    console.log("mul2() called with " + x + " and " + y);
    //    return x * y;
    // }
    // session.register('com.example.mul2', mul2).then(
    //    function (reg) {
    //       console.log('procedure registered');
    //    },
    //    function (err) {
    //       console.log('failed to register procedure', err);
    //    }
    // );


    // CALL a remote procedure every second
    // //
    // var x = 0;

    // t2 = setInterval(function () {

    //    session.call('com.example.add2', [x, 18]).then(
    //       function (res) {
    //          console.log("add2() result:", res);
    //       },
    //       function (err) {
    //          console.log("add2() error:", err);
    //       }
    //    );

    //    x += 3;
    // }, 1000);