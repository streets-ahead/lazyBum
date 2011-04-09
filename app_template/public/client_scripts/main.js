var dialog = {
	isHidden : true,
	hide : function() {
		if(!this.isHidden) {
			$('#twitter-box').fadeOut('fast');
			$('.twitter-tab').removeClass('active');
			$('.twitter-tab').closest('li').removeClass('click');
			this.isHidden = true;
		}
	},
	show : function() {
		if(this.isHidden) {
			var tweets = $('#tweets');
			tweets.html('<div class="loading"> </div>');
			$.get('/tweets', function(data) {
				tweets.html(data);	
			});
			$('#twitter-box').fadeIn('fast');
			$('.twitter-tab').addClass('active');
			$('.twitter-tab').closest('li').addClass('click');
			this.isHidden = false;
		}
	}
};

var pageState = {};

function getHash() {
	return window.location.hash.substring(2);
}

function getHashRoot() {
	var hashVal = getHash();
	hashVal = stripLeadingSlash(hashVal);

	var rootHash = hashVal.indexOf('/') > -1 ? hashVal.substring(0, hashVal.indexOf('/')) : hashVal;

	if( (rootHash.indexOf('article') === 0) || (rootHash.indexOf('author') === 0) ) {
		rootHash = 'blog';
	} 
		
	return rootHash;
}

function stripLeadingSlash(hashVal) {
	if(hashVal.indexOf('/') === 0 ) {
		hashVal = hashVal.substring(1);
	}

	return hashVal;
}

function setUpComments(postblock) {
	var cs = $('#comment-section');
	cs.append(postblock);
	postblock.show();
	cs.fadeIn('fast');
	var selected = $('#nav a[href="/' + getHashRoot() + '"]');
	document.title = $('.post h1').text() + " | " + selected.attr('title') + " | Streets Ahead LLC."
}

function navigate() {
	var sc = $('#slide-container');	

	var newRoot = getHashRoot();
	var newPage = getHash();

	if(!pageState.firstLoad && newPage !== pageState.oldPage) {
		var cs = $('#comment-section');
		cs.fadeOut('fast');
		cs.empty();
		
		console.log('switching page to ' + newPage);
		
		if(newRoot !== pageState.oldRoot) {
			if(pageState[newRoot] !== newPage) {
				pageState[newRoot] = newPage;	
				var ajaxLoading = swapToLoading(getHashRoot());
				slideToTab(function() {
					sc.animate( {'height' : "300px"}, 'fast', function() {
						loadContent(ajaxLoading);
					});
				});
			} else {
				slideToTab(function() {
					$('#slide-container').animate( {'height' : getCurrentPageContent().height()}, 'fast');
				});
			}
			changeActive();
		} else {
			pageState[newRoot] = newPage;
			var ajaxLoading = swapToLoading(getHashRoot());
			loadContent(ajaxLoading);
		}
	}

	pageState.firstLoad = false;
	pageState.oldRoot = getHashRoot();
	pageState.oldPage = getHash();
}

function getCurrentPageContent() {
	var hashVal = getHashRoot();
	console.log(hashVal);
	return $('#' + hashVal);
}

function changeActive() {
	$('.active').removeClass('active');
	$('.click').removeClass('click');
	var selected = $('#nav a[href="/' + getHashRoot() + '"]');
	var liParent = selected.closest('li');
	document.title = selected.attr('title') + " | Streets Ahead LLC."
	selected.addClass('active');
	liParent.addClass('click');
}

function loadContent(currentPage) {
	console.log('making request to ' + getHash());
	$.ajax(getHash() + '?inner=true', {
		success : function(data, textStatus, jqXHR) {

			if(typeof _gaq !== 'undefined') {
				console.log('track ajax page view');
				_gaq.push(['_trackPageview', getHash()]);
			}

			// console.log(data);
			$('#dummy').html(data);
			var newCont = $('#dummy').contents();
		
			var newImgs = newCont.find('img');
			var loadedImgs = 0;
			// newCont.css('visibility', 'hidden');
			
			var done = function() {
				setTimeout( function() {	
					var newHeight = $('#dummy').height();
					console.log(newHeight);
					newCont.find('a').click(clickLink);
					$('#slide-container').animate( {'height' : newHeight}, 'fast', function() {
						console.log('replacing current page');
						currentPage.replaceWith(newCont);

						var postblock = newCont.find('#postblock');
						if(postblock.length) {
							setUpComments(postblock);
						} 
					});	
				}, 10);
			}

			if(newImgs.length === 0) {
				done();
			}

			newImgs.load(function() {	
				loadedImgs++;
				if(loadedImgs === newImgs.length) {
					done();
				}
			});
			
		}
	});
}

function swapToLoading(tab) {
	var currentPage = $('#' + tab);
	var ajaxLoading = $('<div class="inner not-loaded" id="' + tab + '"> </div>');
	currentPage.replaceWith(ajaxLoading);

	return ajaxLoading;
}

function slideToTab(callback) {
	var currentPage = getCurrentPageContent();
	var leftScroll = currentPage.position().left;
	var leftScrollInt = -1 * parseInt(leftScroll, 10);
	changeActive();

	$('#slide-content').animate({"left":leftScrollInt}, function() {
		callback();
	});	
}

function getPathName() {
	var loc = window.location;
	if(loc.pathname && loc.pathname != '/') {
		return loc.pathname.substring(1);	
	} else {
		return 'home';
	}
}

function getPathRoot() {
	var path = getPathName();
	path = stripLeadingSlash(path);

	return path.indexOf('/') > -1 ? path.substring(0, path.indexOf('/')) : path;
}

function initUrl() {
	var loc = window.location;
	if(!loc.hash) {
		loc.hash = '!' + getPathName();
	}
}

function setUpSider() {
	var pages = $('#nav .navtab');
	var slideCont = $('#slide-content');
	slideCont.css('width', slideCont.width()*pages.length + 'px');
	var innerEl = $('.inner');
	var inner = innerEl.attr('id');
	var before = true;
	$('#nav .navtab').each(function(ind, el) {
		var $this = $(this);
		if( stripLeadingSlash($this.attr('href')) === inner ) {
			before = false;
		} else if (before) {
			$('<div class="inner not-loaded" id="' + stripLeadingSlash($this.attr('href')) + '"></div>').insertBefore(innerEl);
		} else {
			console.log('adding inner');
			slideCont.append($('<div class="inner not-loaded" id="' + stripLeadingSlash($this.attr('href')) + '"></div>'));
		}
	});

	
	var leftScroll = getCurrentPageContent().position().left;
	var leftScrollInt = -1 * parseInt(leftScroll, 10);
	slideCont.css('left', leftScrollInt);

}

function clickLink() {
	// try{
		var nextPage = $(this).attr('href');
		if(nextPage.indexOf('#') > -1) {
			nextPage = nextPage.substring(0, nextPage.indexOf('#'));	
		}

		if(nextPage.indexOf('http://') !== 0) {
			window.location.hash =  '!' + nextPage;
			pageState.firstLoad = false;
			return false;
		} else {
			return true;
		}
		// } catch(e) {
		// 	console.log(e);
		// } finally {
		// 	return false;
		// }
}

$(function() {
	pageState.firstLoad = true;
	initUrl();
	setUpSider();
	$(window).load(function() {
		if(stripLeadingSlash(getHash()) !== getPathName()) {
			if(getPathRoot() !== getHashRoot()) {
				var ajaxLoading = swapToLoading(getHashRoot());
				slideToTab(function() {
					loadContent(ajaxLoading);
				});
				changeActive();
			} else {
				var ajaxLoading = swapToLoading(getHashRoot());
				loadContent(ajaxLoading);
			}
		}
		pageState[getHashRoot()] = '/' + getHash();
		pageState.oldRoot = getHashRoot();
		pageState.oldPage = getHash();
	});

	window.onhashchange = navigate;

	$('#nav .navtab, #header h1 a, #main_content a').click(clickLink);

	$('.twitter-tab').click(function() {
		if(dialog.isHidden) {
			dialog.show();
		} else {
			dialog.hide();
		}

		return false;
	});

	var tweets = $('#tweets');
	tweets.html('<div class="loading"> </div>');
	$.get('/tweets', function(data) {
		tweets.html(data);	
		$('#tweet-count').text($(data).find('li').length-1);
	});

	$('body').bind('click', function(e){
		var targetEl = $(e.target)
	    if(!dialog.isHidden && !targetEl.is('#twitter-box, #twitter-box a') && !targetEl.closest('#twitter-box').length){
	    	dialog.hide();
	    }
	});
});
