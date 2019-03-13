window.addEventListener('load', function(event) {
	initXonElement('ccXonomy') ;
}) ;

var chartD8N ;
var chartP9S ;

/* init Xonomy element */
function initXonElement(id) {
	var xonDiv = document.getElementById(id) ;
	Xonomy.setMode("laic") ;
	Xonomy.render(chartS11N.defdef, xonDiv, chartS11N.Xonomy) ;
}

/* register events */
document.addEventListener('DOMContentLoaded', function(event) {

	/* addEventListener doesn't work with Bootstrap (SO #24211185) */
	$('#ccGalleryCarousel').on('slid.bs.carousel', updateBtnConf) ;

	document.addEventListener('scroll', fadeCaptionOutro ) ;

	document.addEventListener('click', closeBurgerMenu ) ;
	var a = document.querySelectorAll('a') ;
	for (var i=0 ; a.length>i ; i++ ) {
		a[i].addEventListener('click', smoothScrollToAnchor) ;
	}
	document.querySelector('#ccBtnLoad').addEventListener('click', btnLoad) ;
	document.querySelector('.navbar-toggler').addEventListener('click', btnToggleMenu) ;
	document.querySelector('#ccBtnNew').addEventListener('click', btnNew) ;
	document.querySelector('#ccBtnOpen').addEventListener('click', btnOpen) ;
	document.querySelector('#ccBtnExec').addEventListener('click', btnExec) ;
	document.querySelector('#ccBtnSave').addEventListener('click', btnSave) ;
	document.querySelector('#ccBtnLast').addEventListener('click', btnLast) ;
	document.querySelector('#ccBtnTglP').addEventListener('click', btnTglP) ;
	document.querySelector('#ccBtnTglD').addEventListener('click', btnTglD) ;
}) ;

/* toggle to definition button */
function btnTglD(event) {
	$(this).toggleClass('d-md-block') ;
	$('#ccBtnTglP').toggleClass('d-md-block') ;
}

/* toggle to preferences button */
function btnTglP(event) {
	$(this).toggleClass('d-md-block') ;
	$('#ccBtnTglD').toggleClass('d-md-block') ;
}

function btnLast(event) {
}

function btnSave(event) {
	$('#ccBtnLast').prop('disabled', false) ;
}

function btnExec(event) {
}

function btnOpen(event) {
}

function btnNew(event) {
	initXonElement('ccXonDiv') ;
	$('#ccBtnExec').prop('disabled', true) ;
	$('#ccBtnSave').prop('disabled', true) ;
}

/* toggle burger and cross icons */
function btnToggleMenu(event) {
	$(this).find('i').toggleClass('fa-bars fa-times') ;
}

/* load composer with files defined by active carosuel item */
function btnLoad(event) {
	var chart = $('.carousel .active').attr('data-load-chart') ;
	var prefs = $('.carousel .active').attr('data-load-prefs') ;
	$.ajax({url: chart, success: function(data) {console.log(data)}}) ;
	$.ajax({url: prefs, success: function(data) {console.log(data)}}) ;
}

function smoothScrollToAnchor(event) {
		if (this.hash !== "") {
			var hash = this.hash ;
			event.preventDefault() ;
			$('html, body').animate({ scrollTop: $(this.hash).offset().top }, 800, function() { window.location.hash = hash ; }) ;
		}
}

/* close open burger menu on any click */
function closeBurgerMenu(event) {
	var clickedOn = $(event.target) ;
	var navOpened = $('.navbar-collapse').hasClass('show') ;
	if (navOpened === true && !clickedOn.hasClass('navbar-toggler')) {
		$('.navbar-toggler').click() ;
	}
}

/* fade button at bottom of home on scroll */
function fadeCaptionOutro(event) {
	$('.caption-outro').css('opacity', 1-$(window).scrollTop()/480) ;
}

/* update button configurations according to carousel state */
function updateBtnConf(event) {
	var view = $('.carousel .active').attr('data-view') ;
	document.getElementById('ccBtnView').href = view ;
	var info = $('.carousel .active').attr('data-info') ;
	document.getElementById('ccBtnInfo').href = info ;
}
