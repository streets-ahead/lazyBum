var querystring = require('querystring');

var Pagination = function(objects, baseUrl, qs) {
	this.objects = objects;
	this.pageSize = 20;
	this.pageCount = Math.ceil(objects.length/this.pageSize);
	this.pageCount = this.pageCount > 1 ? this.pageCount : 1;
	this.baseUrl = baseUrl;
	this.qobj = querystring.parse(qs);
	this.currPage = 0;
	if(this.qobj.currentPage) {
		this.currPage = parseInt(this.qobj.currentPage, 10);
	}

	this.startTag = '<p>';
	this.endTag = '</p>';

	this.firstLink = '&lt;&lt;&nbsp;&nbsp;First';
	this.lastLink = 'Last&nbsp;&nbsp;&gt;&gt;';

	this.nextLink = '&gt;';
	this.prevLink = '&lt;';

	this.linkClass = '';
}

var spaces = '&nbsp;&nbsp;&nbsp;&nbsp;';

exports.createPagination = function(objects, baseUrl, queryString) {
	return new Pagination(objects, baseUrl, queryString);
}

Pagination.prototype.setPageSize = function(size) {
	this.pageSize = size;
	this.pageCount = Math.ceil(this.objects.length/size);
	this.pageCount = this.pageCount > 1 ? this.pageCount : 1;
}

Pagination.prototype.createLinks = function() {
	var url = this.baseUrl;
	var output = this.startTag;

	if(this.baseUrl.indexOf('?') > -1) {
		url += '&';
	} else {
		url += '?';
	}

	url = 'currentPage=__PAGE__';
	output += '<a href="' + url.replace('__PAGE__', '0') + '">' + this.firstLink + '</a>' + spaces; 
	output += '<a href="' + url.replace('__PAGE__', (this.currPage===0 ? 0 : this.currPage-1) ) + '">' + this.prevLink + '</a>' + spaces; 

	for(var i = 0; i < this.pageCount; i++) {
		if(this.currPage === i) {	
			output += '<strong><a href="' + url.replace('__PAGE__', i) + '">' + i + '</a></strong>';
		} else {
			output += '<a href="' + url.replace('__PAGE__', i) + '">' + i + '</a>';
		}

		output += spaces;
	}

	output += '<a href="' + url.replace('__PAGE__', (this.currPage===this.pageCount-2 ? this.pageCount-1 : this.currPage+1) ) + '">' + this.nextLink + '</a>' + spaces; 
	output += '<a href="' + url.replace('__PAGE__', this.pageCount-1) + '">' + this.lastLink + '</a>' + this.endTag;
	return output
}

Pagination.prototype.getCurrentResults = function() {
	var start = this.currPage*this.pageSize;
	return this.objects.slice(start, start + this.pageSize);
}