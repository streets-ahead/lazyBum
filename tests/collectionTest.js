var Collection = require('../lib/Collection');

var col = new Collection('myTable', {
										post : {type : 'String'},
										title : {type : 'String'},
										createdDate : {type : 'Date'},
										updatedDate : {type : 'Date'},
										published : {type : 'Bool', default : false},
										tags : {type : 'Array'},
										author : {type : 'String', default : 'Sam'},
										saId : {type : 'Int', default : 0}
									});
									
console.log(col)
var schemaTest = new col.schema();
schemaTest.post = 'test me awesome!';
//schemaTest.published = 'true';
schemaTest.saId = '3';
schemaTest.createdDate = 'May 12, 1984';

console.log(schemaTest.post);
console.log(schemaTest.published);
console.log(schemaTest.createdDate);
console.log(schemaTest.author);
console.log(schemaTest.saId);

col.findAll(function(s2) {
	console.log(s2[0].post);
	console.log(s2[0].title);
	console.log(s2[0].createdDate);
	console.log(s2[0].published);
	console.log(s2[0].author);
	console.log(s2[0].saId);
});




