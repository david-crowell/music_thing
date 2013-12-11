function index(request, response) {
	var pwd = process.env.PWD;
	console.log(pwd);
	if (!pwd) {
		pwd = process.cwd()
		console.log(pwd);
	}
	response.sendfile(pwd + "/public/html/discover.html");
}
exports.index = index;