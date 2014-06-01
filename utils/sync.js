function parallel(callback, error, functions, nonCallbackErrorArguments) {
	var completed = 0;
	var toDo = functions.length;

	function done() {
		completed += 1;
		if (completed == toDo) {
			callback();
		}
	}

	for (var i = 0; i < functions.length; i++) {
		var arguments = [done, done].concat(nonCallbackErrorArguments[i]);
		functions[i].apply(this, arguments);
	}
	return;
}
exports.parallel = parallel;

function parallelSaveResults(callback, error, functions, nonCallbackErrorArguments) {
	var completed = 0;
	var toDo = functions.length;
	var results = [];

	function done() {
		completed += 1;
		if (completed == toDo) {
			callback(results);
		}
	}

	for (var i = 0; i < functions.length; i++) {
		var arguments = [done, done].concat(nonCallbackErrorArguments[i]);
		results.append(functions[i].apply(this, arguments));
	}
	return;
}

/* You can match the index of the function in your input with the key in the argument to your callback containing
 *   the argument each of your functions passed to its callback
 *
 * Contract: 
 *   - each member of funcitons takes at least two arguments, arg0 = callback, arg1 = error
 *   - the members of each array in nonCallbackErrorArguments will be passed to the appropriate function as arg2, arg3, etc.
 *   - the arguments each member of functions passes to its callbacks will be returned in parallelSaveCallbackArgs's callback
 *     - that callback will get one argument, a dictionary mapping 
 *       - key = (a string of) the index of the function that generated these callback arguments
 *       - value = a dictionary mapping (a string of) the arg index to the arg
 *
 * Example:
 *   parallelSaveCallbackArgs(  
 *      yourCallback, 
 *      yourError, 
 *      [
 *          function(callback, error, val){
 *              callback(Math.ceil(val));
 *          },
 *          function(callback, error, a, b){
 *              callback(Math.pow(a,b));
 *          }
 *      ], 
 *      [
 *          [.1], 
 *          [3,2]
 *      ] 
 *   );
 *   
 *   runs the Match.ceil(.1) wrapper and Math.pow(3,2) wrapper in as close to parallel as node has
 *   you get back:
 *  
 *  {
 *      "0": ["0":1],
 *      "1": ["0":9]
 *  }
 */
function parallelSaveCallbackArgs(callback, error, functions, nonCallbackErrorArguments) {
	var completed = 0;
	var toDo = functions.length;
	var callbackArgs = [];

	function done(i, args) {
		completed += 1;

		var callbackArg = {}; callbackArg[i] = args; callbackArgs.push(callbackArg);

		if (completed == toDo) {
			console.log("completed == toDo");
			callback(callbackArgs);
		}
	}

	for (var i = 0; i < functions.length; i++) {
		// sort of silly closure to trap the i so we can identifiy which function each callbackArgs came from
		function runIdentifiedFunctionWithNonCallbackErrorArgs(i, func, otherArgs) {
			function doneWithI() {
				done([i],arguments);
			}
			var args = [doneWithI, doneWithI].concat(otherArgs);
			func.apply(this, args);
		}
		runIdentifiedFunctionWithNonCallbackErrorArgs(i,functions[i],nonCallbackErrorArguments[i]);
	}
	return;
}

function test(){
	function foo(callback, error, a, b) {
		console.log("<<" + a + ":" + b + ">>");
		callback("<<" + a + ":" + b + ">>");
	}

	function foo2(callback, error, a, b, c) {
		console.log("<<" + a + ":" + b + ":" + c + ">>");
		callback("<<" + a + ":" + b + ":" + c + ">>");
	}

	function sum5(callback, error, a, b, c, d, e) {
		console.log("sum5");
		callback(a + b + c + d + e);
	}

	function connect4(callback, error, a, b, c, d) {
		console.log("connect4");
		callback(a + ":" + b + "::" + c + ":" + d, a, b, c, d);
	}

	parallelSaveCallbackArgs(
		function (callbackArgs) {
			console.log("done");
			console.log(callbackArgs);
		},
		function (e) {
			console.log("error");
		},
		[sum5, foo, connect4], 
		[[1,2,3,4,5], [5,6], ['ass','butt','stuff','things']]
	);
}
test();