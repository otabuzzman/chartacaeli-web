window.addEventListener('load', function (event) {
	initComposer() ;
}) ;

function initComposer() {
	/* init state object template*/
	var statTmpl = {
		stat: {
			value: State.EMPTY,
			writable: true, enumerable: true, configurable: false
		},
		open: {
			value: null,
			writable: true, enumerable: true, configurable: false
		},
		hold: {
			value: null,
			writable: true, enumerable: true, configurable: false
		}
	} ;
	/* init definition state object */
	statD8N = Object.create(chartS11N, statTmpl) ;
	statThis = statD8N ;
	statThis.open = statD8N.defdef ;
	/* init preferences state object */
	statP9S = Object.create(prefsS11N, statTmpl) ;
	statExch = statP9S ;
	statExch.open = statP9S.defdef ;
	/* load Composer with current state object */
	initXonomy() ;
	loadXonomy('#ccXonomy') ;
}

function initXonomy() {
	Xonomy.setMode("laic") ;
}
function loadXonomy(id) {
	var xonDiv = $(id) ;
	if (xonDiv.css('display') === 'none') {
		return ;
	}
	Xonomy.render(statThis.open, xonDiv[0], statThis.Xonomy) ;
}
function grabXonomy(id) {
	var xonDiv = $(id) ;
	if (xonDiv.css('display') === 'none') {
		return null ;
	}
	return Xonomy.harvest() ;
}

/* definition and preferences state objects */
var statD8N ;
var statP9S ;
/* runtime state objects referencing D/P */
var statThis ;
var statExch ;

/* state and event values enumerations */
const State = Object.freeze({NONE: 0, EMPTY: 1, OPENED: 2, CHANGED: 3, WARNING: 4}) ;
const Event = Object.freeze({NONE: 0, NEW: 1, OPEN: 2, CHANGE: 3, RETURN: 4}) ;
/* transition table */
const Transition = Object.freeze([
	/*         Non,        New,        Opn,        Chg,        Ret,     */
	/* Non */ [aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotInvalid],
	/* Emp */ [aotInvalid, aotInvalid, aotEmpOpn,  aotEmpChg,  aotInvalid],
	/* Opn */ [aotInvalid, aotOpnNew,  aotOpnOpn,  aotOpnChg,  aotInvalid],
	/* Chg */ [aotInvalid, aotChgNew,  aotChgOpn,  aotChgChg,  aotInvalid],
	/* Wrn */ [aotInvalid, aotWrnNew,  aotWrnOpn,  aotInvalid, aotWrnRet ]
]) ;

/* transition actions */
function aotInvalid() {
	console.log("INV") ;
}
function aotEmpOpn() {
	statThis.open = statThis.hold ;
	statThis.hold = null ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
	statThis.stat = State.OPENED ;
	StateSetter[statThis.stat]() ;
	console.log("Emp/Opn") ;
}
function aotEmpChg() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Emp/Chg") ;
}
function aotOpnNew() {
	statThis.open = statThis.defdef ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer').offset().top}, 800) ;
	statThis.stat = State.EMPTY ;
	StateSetter[statThis.stat]() ;
	console.log("Opn/New") ;
}
function aotOpnOpn() {
	statThis.open = statThis.hold ;
	statThis.hold = null ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
	statThis.stat = State.OPENED ;
	StateSetter[statThis.stat]() ;
	console.log("Opn/Opn") ;
}
function aotOpnChg() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Opn/Chg") ;
}
function aotChgNew() {
	/* memorize event for later use by mBtnWarn2nd */
	$('#ccMBtnWarn2nd').data('event', Event.NEW) ;
	$('#ccWarning').modal('toggle') ;
	statThis.stat = State.WARNING ;
	StateSetter[statThis.stat]() ;
	console.log("Chg/New") ;
}
function aotChgOpn() {
	/* memorize event for later use by mBtnWarn2nd */
	$('#ccMBtnWarn2nd').data('event', Event.OPEN) ;
	$('#ccWarning').modal('toggle') ;
	statThis.stat = State.WARNING ;
	StateSetter[statThis.stat]() ;
	console.log("Chg/Opn") ;
}
function aotChgChg() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Chg/Chg") ;
}
function aotWrnNew() {
	statThis.open = statThis.defdef ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer').offset().top}, 800) ;
	statThis.stat = State.EMPTY ;
	StateSetter[statThis.stat]() ;
	console.log("Wrn/New") ;
}
function aotWrnOpn() {
	statThis.open = statThis.hold ;
	statThis.hold = null ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
	statThis.stat = State.OPENED ;
	StateSetter[statThis.stat]() ;
	console.log("Wrn/Opn") ;
}
function aotWrnRet() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Wrn/Ret") ;
}

/* button states setter functions table */
var StateSetter = Object.freeze([
	function () { // State.NONE
	},
	function () { // State.EMPTY
		$('#ccBtnNew').prop('disabled', true) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', true) ;
	},
	function () { // State.OPENED
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', false) ;
	},
	function () { // State.CHANGED
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', false) ;
	},
	function () { // State.WARNING
	}
]) ;

/* register events */
document.addEventListener('DOMContentLoaded', function (event) {

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
	document.querySelector('#ccInpOpen').addEventListener('change', inpOpen) ;
	document.querySelector('#ccBtnExec').addEventListener('click', btnExec) ;
	document.querySelector('#ccBtnTglP').addEventListener('click', btnTglP) ;
	document.querySelector('#ccBtnTglD').addEventListener('click', btnTglD) ;
	document.querySelector('#ccMBtnWarn1st').addEventListener('click', mBtnWarn1st) ;
	document.querySelector('#ccMBtnWarn2nd').addEventListener('click', mBtnWarn2nd) ;
}) ;

function mBtnWarn2nd(event) {
	Transition[statThis.stat][$(this).data('event')]() ;
	$('#ccWarning').modal('toggle') ;
}
function mBtnWarn1st(event) {
	Transition[statThis.stat][Event.RETURN]() ;
	$('#ccWarning').modal('toggle') ;
}

/* toggle to definition button */
function btnTglD(event) {
	$(this)
	.toggleClass('d-md-block')
	.prop('disabled', true) ;
	$('#ccBtnTglP')
	.toggleClass('d-md-block')
	.prop('disabled', false) ;
	/* save current Composer */
	statThis.open = grabXonomy() ;
	/* toggle runtime state objects */
	statThis = statD8N ;
	statExch = statP9S ;
	/* load Composer from toggled state object */
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
	StateSetter[statThis.stat]() ;
}

/* toggle to preferences button */
function btnTglP(event) {
	$(this)
	.toggleClass('d-md-block')
	.prop('disabled', true) ;
	$('#ccBtnTglD')
	.toggleClass('d-md-block')
	.prop('disabled', false) ;
	/* save current Composer */
	statThis.open = grabXonomy() ;
	/* toggle runtime state objects */
	statThis = statP9S ;
	statExch = statD8N ;
	/* load Composer from toggled state object */
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
	StateSetter[statThis.stat]() ;
}

function btnExec(event) {
	var rest = $(this).attr('data-rest-api') ;
	$.ajax({
		url: rest
	}).then(function(data) {
		console.log(data) ;
	}) ;
}

function btnOpen(event) {
	$('#ccInpOpen').focus().trigger('click') ;
}
function inpOpen(event) {
	var file = new FileReader() ;
	file.onload = function (e) {
		statThis.hold = this.result.replace(/(\r?\n|\r)\s*/g, "") ;
		Transition[statThis.stat][Event.OPEN]() ;
	} ;
	file.readAsText($(this)[0].files[0]) ;
	/* allow to select same file several times in a row (SO #12030686) */ 
	this.value = null ;
}

function btnNew(event) {
	Transition[statThis.stat][Event.NEW]() ;
}

/* toggle burger and cross icons */
function btnToggleMenu(event) {
	$(this).find('i').toggleClass('fa-bars fa-times') ;
}

/* load Composer with files defined by active carosuel item */
function btnLoad(event) {
	var href, chart, prefs ;
	/* fetch definition */
	href = $('.carousel .active').attr('data-load-chart') ;
	$.ajax({url: href,
		dataType: 'text',
		dataFilter: function (data, type) {return data.replace(/(\r?\n|\r)\s*/g, "")},
		success: function (data) {
			chart = data ;
			statD8N.open = chart ;
			/* fetch preferences */
			href = $('.carousel .active').attr('data-load-prefs') ;
			if (href) {
				$.ajax({url: href,
					dataType: 'text',
					dataFilter: function (data, type) {return data.replace(/(\r?\n|\r)\s*/g, "")},
					success: function (data) {
						prefs = data ;
						statP9S.open = prefs ;
						loadXonomy('#ccXonomy') ;
					}}) ;
			} else {
				loadXonomy('#ccXonomy') ;
			}
		}
	}) ;
}

function smoothScrollToAnchor(event) {
		if (this.hash !== "") {
			var hash = this.hash ;
			event.preventDefault() ;
			$('html, body').animate({scrollTop: $(hash).offset().top}, 800, function () {window.location.hash = hash}) ;
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
	// enable Load if D8N available...
	var load = $('.carousel .active').attr('data-load-chart') ;
	// ...AND Composer NOT in state changed
	var d8n = statD8N.stat === State.CHANGED ;
	var p9s = statP9S.stat === State.CHANGED ;
	if (load && !(d8n || p9s)) {
		$('#ccBtnLoad')	.removeClass('disabled') ;
	} else {
		$('#ccBtnLoad')	.addClass('disabled') ;
	}
}
