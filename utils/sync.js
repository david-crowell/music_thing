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

// Doing in parallel means we can't guarantee the order of callbackArg results!
function parallelSaveCallbackArgs(callback, error, functions, nonCallbackErrorArguments) {
	var completed = 0;
	var toDo = functions.length;
	var callbackArgs = [];

	function done() {
		completed += 1;
		callbackArgs.push(arguments);
		if (completed == toDo) {
			console.log("completed == toDo");
			callback(callbackArgs);
		}
	}

	for (var i = 0; i < functions.length; i++) {
		var arguments = [done, done].concat(nonCallbackErrorArguments[i]);
		//console.log(arguments);
		functions[i].apply(this, arguments);
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
		callback(a + ":" + b + "::" + c + ":" + d);
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