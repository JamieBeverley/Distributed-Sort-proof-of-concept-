///////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) Crossbar.io Technologies GmbH and/or collaborators. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//  POSSIBILITY OF SUCH DAMAGE.
//
///////////////////////////////////////////////////////////////////////////////

//Generate test array to mergeSort
var test1 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var test2 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var test3 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
var test4 = Array.apply(null, Array(90000)).map(function() {return Math.round(Math.random() * 1000);});
// var testCase = test1.concat(test2).concat(test3).concat(test4)
var testCase = [1,4,5,1,6,4,6];


var count = 0;

var autobahn = require('autobahn');

var connection = new autobahn.Connection({
   url: 'ws://127.0.0.1:8080/ws',
   realm: 'realm1'}
);


function sort(args){
 console.log("Sorting")
 var result = mergeSort(args)
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

var test = function test (args){

   console.log("function test called with args: " +args)
}

function join (){
   console.log("New Client")
   count++
   console.log("Client count:  "+count)
}

function leave(){
   console.log("Client left")
   count--
   console.log("Client count:  "+count)
}







connection.onopen = function (session) {


   var distributeSort = function (items){
      var clients;
      var returns=[];
      var result = [];
      console.log("distribut sort called")
      var completed = 0;
      var time1 = (new Date).getTime();

      session.call('wamp.session.list').then(function(res){
         clients = res;
         var portion = Math.ceil(items.length/clients.length);

         var time1 = (new Date).getTime();
         for (i=0; i<clients.length;i++){
      
            session.call('com.myapp.sort'+clients[i], items.slice(i*portion,(i+1)*portion)).then(
               function(res){
                  console.log("result length " +res.length)
                  returns.push(res)
                  completed++;

                  // If all the clients have completed their merges...
                  if(completed == clients.length){
                     for (i in returns){
                        result = merge(result, returns[i])
                     }
                     console.log("task finished in: "+((new Date).getTime()-time1) + " milliseconds.")
                  }
               },
               function(err){
                  console.log("Ooops:  "+errr.error)
               }
            )
            
         }
      },function(err){
         console.log("Error retrieving client list: "+err.error)
      })
   }


   console.log("Opened Server")
   console.log(session.id)
   session.subscribe('wamp.session.on_join', join)
   session.subscribe('wamp.session.on_leave', leave)

   session.register('com.myapp.distributeSort', distributeSort)

   session.register('com.myapp.sort'+session.id, sort)


   setInterval(function(){

      session.call('wamp.session.list').then(function(res){
         console.log(res)
      },function(err){
         console.log("didn't work")
      })
      // session.call('com.myapp.sort8947707055871203',[1,2,5,1,6,1]).then(function(res){
      //    console.log(res)
      // },function(err){
      //    console.log("didn't work: "+err.error)
         
      //    for (i in err)
      //       console.log(i)
      // })
   },1000)

   // session.register('com.myapp.distributeSort', distributeSort)

   // setTimeout(function () {

   //    // CALL a remote procedure
   //    //
   //    console.log("sent")

   //    var left = mergeSort(test1.slice(0,parseInt(test1.length/2)));
   //    console.log(left)
   //    var result;
   //    // session.call('com.myapp.sort', [1,2,3,4,5]).then(
   //    session.call('com.myapp.sort', test1.slice(parseInt(test1.length/2),test1.length)).then(
      
   //       function (res) {
   //          console.log("result: " + res)
   //          result = merge(left, res)
   //          // result = [1,2,3,4]
   //          console.log("r is :"+ result);
   //       },
   //       function (err) {
   //          if (err.error !== 'wamp.error.no_such_procedure') {
   //             console.log('call of sort() failed: ' + err);
   //          }
   //       }
   //    );
   // }, 2000);
};

connection.open();
