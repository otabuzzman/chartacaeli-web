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
	var head, data ;
	var xonDiv = $(id) ;
	if (xonDiv.css('display') === 'none') {
		return null ;
	}
	head = statThis.XMLdec ;
	data = Xonomy.harvest() ;
	return head+data ;
}

/* chart generation timeout handler */
var hdExecWait ;
/* chart generation poll interval handler */
var hdExecPoll ;

/* definition and preferences state objects */
var statD8N ;
var statP9S ;
/* runtime state objects referencing D/P */
var statThis ;
var statExch ;

/* state and event values enumerations */
const State = Object.freeze({NONE: 0, EMPTY: 1, OPENED: 2, CHANGED: 3, RUNNING: 4, WARNING: 5, ERROR: 6}) ;
const Event = Object.freeze({NONE: 0, NEW: 1, OPEN: 2, EXEC: 3, CHANGE: 4, RETURN: 5, ERROR: 6}) ;
/* transition table */
const Transition = Object.freeze([
	/* S/E     Non,        New,        Opn,        Exe,        Chg,        Ret,        Err,     */
	/* Non */ [aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotInvalid],
	/* Emp */ [aotInvalid, aotInvalid, aotEmpOpn,  aotInvalid, aotEmpChg,  aotInvalid, aotInvalid],
	/* Opn */ [aotInvalid, aotOpnNew,  aotOpnOpn,  aotOpnExe,  aotOpnChg,  aotInvalid, aotInvalid],
	/* Chg */ [aotInvalid, aotChgNew,  aotChgOpn,  aotChgExe,  aotChgChg,  aotInvalid, aotInvalid],
	/* Run */ [aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotRunRet,  aotRunErr ],
	/* Wrn */ [aotInvalid, aotWrnNew,  aotWrnOpn,  aotInvalid, aotInvalid, aotWrnRet,  aotInvalid],
	/* Err */ [aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotInvalid, aotErrRet,  aotInvalid]
]) ;

/* transition actions */
function aotInvalid() {
	console.log("Inv") ;
}
function aotEmpOpn() {
	$('#ccInpOpen').focus().trigger('click') ;
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
	$('#ccInpOpen').focus().trigger('click') ;
	console.log("Opn/Opn") ;
}
function aotOpnExe() {
	/* memorize state for later use by btnUnsaved2nd (Havel (H)istory) */
	$('#ccBtnExec').data('hist-state', statThis.stat) ;
	statThis.stat = State.RUNNING ;
	StateSetter[statThis.stat]() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	console.log("Opn/Exe") ;
}
function aotOpnChg() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Opn/Chg") ;
}
function aotChgNew() {
	/* memorize event for later use by btnUnsaved2nd (Havel (C)ondition) */
	$('#ccDgWarnKey2nd').data('hist-event', Event.NEW) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	statThis.stat = State.WARNING ;
	StateSetter[statThis.stat]() ;
	console.log("Chg/New") ;
}
function aotChgOpn() {
	/* memorize event for later use by btnUnsaved2nd (Havel (C)ondition) */
	$('#ccDgWarnKey2nd').data('hist-event', Event.OPEN) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	statThis.stat = State.WARNING ;
	StateSetter[statThis.stat]() ;
	console.log("Chg/Opn") ;
}
function aotChgExe() {
	/* memorize state for later use by btnUnsaved2nd (Havel (H)istory) */
	$('#ccBtnExec').data('hist-state', statThis.stat) ;
	statThis.stat = State.RUNNING ;
	StateSetter[statThis.stat]() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	console.log("Chg/Exe") ;
}
function aotChgChg() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Chg/Chg") ;
}
function aotRunRet() {
	statThis.stat = $('#ccBtnExec').data('hist-state') ;
	StateSetter[statThis.stat]() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	console.log("Run/Ret") ;
}
function aotRunErr() {
	statThis.stat = State.ERROR ;
	StateSetter[statThis.stat]() ;
	console.log("Run/Err") ;
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
	$('#ccInpOpen').focus().trigger('click') ;
	console.log("Wrn/Opn") ;
}
function aotWrnRet() {
	statThis.stat = State.CHANGED ;
	StateSetter[statThis.stat]() ;
	console.log("Wrn/Ret") ;
}
function aotErrRet() {
	statThis.stat = $('#ccBtnExec').data('hist-state') ;
	StateSetter[statThis.stat]() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	console.log("Err/Ret") ;
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
	function () { // State.RUNNING
		$('#ccBtnNew').prop('disabled', true) ;
		$('#ccBtnOpen').prop('disabled', true) ;
		$('#ccBtnExec').prop('disabled', true) ;
	},
	function () { // State.WARNING
	},
	function () { // State.ERROR
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
	document.querySelector('#ccDgWarnKey1st').addEventListener('click', dgWarnKey1st) ;
	document.querySelector('#ccDgWarnKey2nd').addEventListener('click', dgWarnKey2nd) ;
	document.querySelector('#ccDgErrorKey').addEventListener('click', dgErrorKey) ;
}) ;

function dgErrorKey(event) {
	Transition[statThis.stat][Event.RETURN]() ;
	$('#ccDgError').modal('toggle') ;
}

function dgWarnKey2nd(event) {
	Transition[statThis.stat][$(this).data('hist-event')]() ;
	$('#ccDgWarn2Key').modal('toggle') ;
}
function dgWarnKey1st(event) {
	Transition[statThis.stat][Event.RETURN]() ;
	$('#ccDgWarn2Key').modal('toggle') ;
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
	var exec, chart, prefs, xhr ;
	hdExecWait = setTimeout(function () {
		clearInterval(hdExecPoll) ;
		Transition[statThis.stat][Event.RETURN]() ;
		xhr.abort() ;
	}, 45000) ;
	Transition[statThis.stat][Event.EXEC]() ;
	/* issue POST */
	statThis.open = grabXonomy() ;
	chart = statD8N.open ;
	prefs = statP9S.open ;
	exec = $(this).attr('data-rest-api') ;
	xhr = $.ajax({
		url: exec,
		method: 'POST',
		data: { chart: chart, prefs: prefs },
		dataType: 'json',
		statusCode: {
			202: function (creq) {exec202(creq)},
			400: function (xhr) {exec400(xhr)},
			500: function (xhr) {exec500(xhr)}
		}
	}) ;
}

function exec202(creq) {
	var next = creq.hateoas.find(function (link) {return link.rel == 'next'}).href ;
	hdExecPoll = setInterval(function () {
		$.ajax({
			url: next,
			method: 'GET',
			success: function(body) {
				if ( typeof body.stat === 'undefined') {
					var pdf = new Blob([body], {type: "application/pdf"}) ;
					var url = window.URL.createObjectURL(pdf) ;
					window.open(url) ;
					clearInterval(hdExecPoll) ;
					clearTimeout(hdExecWait) ;
					Transition[statThis.stat][Event.RETURN]() ;
				} else
					console.log(body.stat) ;
			}
		}) ;
	}, 5000) ;
}

function exec400(xhr) {
	var creq ;
	clearTimeout(hdExecWait) ;
	creq = $.parseJSON(xhr.responseText) ;
	$('#ccDgError .dgerr-400 .creq-info').text(creq.info) ;
	$('#ccDgError').find('[class ^= dgerr-]').addClass('d-none') ;
	$('#ccDgError').find('.dgerr-400').removeClass('d-none') ;
	$('#ccDgError').modal('toggle') ;
	Transition[statThis.stat][Event.ERROR]() ;
}

function exec500(xhr) {
	var creq ;
	clearTimeout(hdExecWait) ;
	creq = $.parseJSON(xhr.responseText) ;
	$('#ccDgError .dgerr-500 .creq-info').text(creq.info) ;
	$('#ccDgError').find('[class ^= dgerr-]').addClass('d-none') ;
	$('#ccDgError').find('.dgerr-500').removeClass('d-none') ;
	$('#ccDgError').modal('toggle') ;
	Transition[statThis.stat][Event.ERROR]() ;
}

function btnOpen(event) {
	Transition[statThis.stat][Event.OPEN]() ;
}
function inpOpen(event) {
	var file = new FileReader() ;
	file.onload = function (e) {
		statThis.open = this.result.replace(/(\r?\n|\r)\s*/g, "") ;
		loadXonomy('#ccXonomy') ;
		$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
		statThis.stat = State.OPENED ;
		StateSetter[statThis.stat]() ;
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
						statP9S.stat = State.OPENED ;
						statD8N.stat = State.OPENED ;
						StateSetter[statThis.stat]() ;
					}}) ;
			} else {
				loadXonomy('#ccXonomy') ;
				statD8N.stat = State.OPENED ;
				StateSetter[statThis.stat]() ;
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
		$('#ccBtnLoad').removeClass('disabled') ;
	} else {
		$('#ccBtnLoad').addClass('disabled') ;
	}
}
