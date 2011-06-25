require.paths.unshift(process.cwd() + "/lib");
var Hobo = require('Hobo'),
	assert = require('assert'),
	fs = require('fs');

var testRender = function(input, sb, expected) {
	var hb = Hobo.getInstance(),
		actual = '';
	
console.log('new ac ' + actual);
	hb.on('data', function(data) {
		actual += data;
	});

	hb.on('end', function() {
		console.log(actual);
		assert.equal(actual, expected, 'The output value was not rendered correctly.');
	});

	hb.render(input, sb);
	hb.removeAllListeners('data');
	hb.removeAllListeners('end');
}

var testRenderSimple = function() {
	var sb = {hello:'Hello World'},
		input = 'test <%=hello%>',
		expected = 'test Hello World';

	testRender(input, sb, expected);
};

var testRenderComplex = function() {

	var sb = {list:[1, 2, 3, 4, 5]},
		input = '<div><ul> <% for(var i=0; i<list.length; i++) { %> <li><%=list[i]%></li> <% } %> </ul></div>',
		expected = '<div><ul>  <li>1</li>  <li>2</li>  <li>3</li>  <li>4</li>  <li>5</li>  </ul></div>';

	testRender(input, sb, expected);
}

var testCompose = function() {
	var hb = Hobo.getInstance();
	

	hb.compose(tmpl, function(result) {
		console.log(result);
	});
}

testRenderSimple();
testRenderComplex();
testCompose();
