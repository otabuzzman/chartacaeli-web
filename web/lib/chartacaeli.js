window.addEventListener('load', function (event) {
	initComposer() ;
}) ;

function initComposer() {
	/* init state object template*/
	var compTmpl = {
			stat: {
				value: State.EMP,
				writable: true, enumerable: true, configurable: false
			},
			open: {
				value: null,
				writable: true, enumerable: true, configurable: false
			}
	} ;
	/* init definition state object */
	compD8N = Object.create(chartS11N, compTmpl) ;
	compThis = compD8N ;
	compThis.open = compD8N.defdef ;
	/* init preferences state object */
	compP9S = Object.create(prefsS11N, compTmpl) ;
	compExch = compP9S ;
	compExch.open = compP9S.defdef ;
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
	Xonomy.render(compThis.open, xonDiv[0], compThis.Xonomy) ;
}
function grabXonomy(id) {
	var head, data ;
	var xonDiv = $(id) ;
	if (xonDiv.css('display') === 'none') {
		return null ;
	}
	head = compThis.XMLdec ;
	data = Xonomy.harvest() ;
	return head+data ;
}

/* chart generation cancel timeout handler */
var hdExecCanc ;
/* chart generation progress timeout handler */
var hdExecPrgs ;
/* chart generation poll interval handler */
var hdExecPoll ;

/* definition and preferences state objects */
var compD8N ;
var compP9S ;
/* runtime state objects referencing D8N/P9S */
var compThis ;
var compExch ;

/* state enumeration names and values */
const stateName = Object.freeze(["EMP", "OPN", "CHG", "WRN", "EXE", "ERR", "POL"]) ;
const State = Object.freeze({EMP: 0, OPN: 1, CHG: 2, WRN: 3, EXE: 4, ERR: 5, POL: 6}) ;
/* event enumeration names and values */
const eventName = Object.freeze(["NEW", "OPN", "LOD", "CHG", "PCD", "CNC", "EXE", "CER", "SER", "TMO", "TGD", "TGP"]) ;
const Event = Object.freeze({NEW: 0, OPN: 1, LOD: 2, CHG: 3, PCD: 4, CNC: 5, EXE: 6, CER: 7, SER: 8, TMO: 9, TGD: 10, TGP: 11}) ;
/* event/ activity table */
const EATab = Object.freeze([
	/* S/ E     New        Opn        Lod        Chg        Pcd        Cnc        Exe        Cer        Ser        Tmo        Tgd        Tgp      */
	/* Emp */  [eaInvalid, eaEmpOpn,  eaEmpLod,  eaEmpChg,  eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaEmpTgd,  eaEmpTgp],
	/* Opn */  [eaOpnNew,  eaOpnOpn,  eaOpnLod,  eaOpnChg,  eaInvalid, eaInvalid, eaOpnExe,  eaInvalid, eaInvalid, eaInvalid, eaOpnTgd,  eaOpnTgp],
	/* Chg */  [eaChgNew,  eaChgOpn,  eaChgLod,  eaChgChg,  eaInvalid, eaInvalid, eaChgExe,  eaInvalid, eaInvalid, eaInvalid, eaChgTgd,  eaChgTgp],
	/* Wrn */  [eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaWrnPcd,  eaWrnCnc,  eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid],
	/* Exe */  [eaExeNew,  eaExeOpn,  eaExeLod,  eaInvalid, eaExePcd,  eaInvalid, eaInvalid, eaExeCer,  eaExeSer,  eaExeTmo,  eaExeTgd,  eaExeTgp],
	/* Err */  [eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaErrPcd,  eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaInvalid],
	/* Pol */  [eaInvalid, eaInvalid, eaInvalid, eaInvalid, eaPolPcd,  eaInvalid, eaInvalid, eaInvalid, eaPolSer,  eaPolTmo,  eaPolTgd,  eaPolTgp]
	]) ;
/* event activities */
function eaInvalid() {
	console.log("Inv") ;
}
function eaEmpOpn() {
	onclickBtnOpen() ;
	console.log("Emp-Opn-Opn") ;
}
function eaEmpLod() {
	onclickBtnLoad() ;
	console.log("Emp-Lod-Opn") ;
}
function eaEmpChg() {
	/* set next FSM and button states */
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	console.log("Emp-Chg-Chg") ;
}
function eaEmpTgd() {
	onclickBtnD8N() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Emp-Tgd-D8N") ;
}
function eaEmpTgp() {
	onclickBtnP9S() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Emp-Tgp-P9S") ;
}
function eaOpnNew() {
	onclickBtnNew() ;
	/* set next FSM and button states */
	compThis.stat = State.EMP ;
	SBTab[compThis.stat]() ;
	console.log("Opn-New-Emp") ;
}
function eaOpnOpn() {
	onclickBtnOpen() ;
	console.log("Opn-Opn-Opn") ;
}
function eaOpnLod() {
	onclickBtnLoad() ;
	console.log("Opn-Lod-Opn") ;
}
function eaOpnChg() {
	/* set next FSM and button states */
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	console.log("Opn-Chg-Chg") ;
}
function eaOpnExe() {
	$('#ccBtnExec').data('stat-hist', compThis.stat) ;
	onclickBtnExec() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	/* set next FSM and button states */
	compThis.stat = State.EXE ;
	SBTab[compThis.stat]() ;
	console.log("Opn-Exe-Exe") ;
}
function eaOpnTgd() {
	onclickBtnD8N() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Opn-Tgd-D8N") ;
}
function eaOpnTgp() {
	onclickBtnP9S() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Opn-Tgp-P9S") ;
}
function eaChgNew() {
	$('#ccDgWarn2Key').data('event-hist', Event.NEW) ;
	$('#ccDgWarn2Key').data('state-hist', compThis.stat) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.WRN ;
	SBTab[compThis.stat]() ;
	console.log("Chg-New-Wrn") ;
}
function eaChgOpn() {
	$('#ccDgWarn2Key').data('event-hist', Event.OPN) ;
	$('#ccDgWarn2Key').data('state-hist', compThis.stat) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.WRN ;
	SBTab[compThis.stat]() ;
	console.log("Chg-Opn-Wrn") ;
}
function eaChgLod() {
	$('#ccDgWarn2Key').data('event-hist', Event.LOD) ;
	$('#ccDgWarn2Key').data('state-hist', compThis.stat) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.WRN ;
	SBTab[compThis.stat]() ;
	console.log("Chg-Lod-Wrn") ;
}
function eaChgChg() {
	console.log("Chg-Chg-Chg") ;
}
function eaChgExe() {
	$('#ccBtnExec').data('stat-hist', compThis.stat) ;
	onclickBtnExec() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	/* set next FSM and button states */
	compThis.stat = State.EXE ;
	SBTab[compThis.stat]() ;
	console.log("Chg-Exe-Exe") ;
}
function eaChgTgd() {
	onclickBtnD8N() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Chg-Tgd-D8N") ;
}
function eaChgTgp() {
	onclickBtnP9S() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Chg-Tgp-P9S") ;
}
function eaWrnPcd() {
	$('#ccDgWarn2Key').modal('toggle') ;
	switch ($('#ccDgWarn2Key').data('event-hist')) {
		case Event.NEW:
			onclickBtnNew() ;
			compThis.stat = State.EMP ;
			/* set button states */
			SBTab[compThis.stat]() ;
		break ;
		case Event.OPN:
			onclickBtnOpen() ;
		break ;
		case Event.LOD:
			onclickBtnLoad() ;
		break ;
	}
	console.log("Wrn-Pcd-EMP|OPN") ;
}
function eaWrnCnc() {
	$('#ccDgWarn2Key').modal('toggle') ;
	compThis.stat = $('#ccDgWarn2Key').data('state-hist') ;
	console.log("Wrn-Cnc-"+stateName[compThis.stat]) ;
}
function eaExeNew() {
	$('#ccDgWarn2Key').data('event-hist', Event.NEW) ;
	$('#ccDgWarn2Key').data('state-hist', compThis.stat) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.WRN ;
	SBTab[compThis.stat]() ;
	console.log("Exe-New-Wrn") ;
}
function eaExeOpn() {
	$('#ccDgWarn2Key').data('event-hist', Event.OPN) ;
	$('#ccDgWarn2Key').data('state-hist', compThis.stat) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.WRN ;
	SBTab[compThis.stat]() ;
	console.log("Exe-Opn-Wrn") ;
}
function eaExeLod() {
	$('#ccDgWarn2Key').data('event-hist', Event.LOD) ;
	$('#ccDgWarn2Key').data('state-hist', compThis.stat) ;
	$('#ccDgWarn2Key').find('[class ^= dgwarn-]').addClass('d-none') ;
	$('#ccDgWarn2Key').find('.dgwarn-unsaved').removeClass('d-none') ;
	$('#ccDgWarn2Key').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.WRN ;
	SBTab[compThis.stat]() ;
	console.log("Exe-Lod-Wrn") ;
}
function eaExePcd(creq) {
	var next = restGetHref(creq.hateoas, 'next') ;
	hdExecPoll = setInterval(function () {
		$.ajax({
			url: next,
			method: 'GET',
			success: function(creq) {
				switch (creq.stat) {
				case 'accepted':
				case 'started':
					EATab[compThis.stat][Event.TMO]() ;
					break ;
				case 'finished':
					EATab[compThis.stat][Event.PCD](creq) ;
					break ;
				default:
					EATab[compThis.stat][Event.SER](creq) ;
				break ;
				}
			},
			error: function (xhr) {
					EATab[compThis.stat][Event.SER]($.parseJSON(xhr.responseText)) ;
			}
		}) ;
	}, 5*1000) ; /* 5 sec */
	hdExecPrgs = setTimeout(function () {
		$('#ccDgInfo').modal('toggle') ;
	}, 15*1000) ; /* 15 sec */
	/* set next FSM and button states */
	compThis.stat = State.POL ;
	SBTab[compThis.stat]() ;
	console.log("Exe-Pcd-Pol") ;
}
function eaExeCer(creq) {
	clearTimeout(hdExecCanc) ;
	$('#ccDgFail .dgfail-exec400 .creq-info').text(creq.info) ;
	$('#ccDgFail').find('[class ^= dgfail-]').addClass('d-none') ;
	$('#ccDgFail').find('.dgfail-exec400').removeClass('d-none') ;
	$('#ccDgFail').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.ERR ;
	SBTab[compThis.stat]() ;
	console.log("Exe-Cer-Err") ;
}
function eaExeSer(creq) {
	clearTimeout(hdExecCanc) ;
	$('#ccDgFail .dgfail-exec500 .creq-info').text(creq.info) ;
	$('#ccDgFail').find('[class ^= dgfail-]').addClass('d-none') ;
	$('#ccDgFail').find('.dgfail-exec500').removeClass('d-none') ;
	$('#ccDgFail').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.ERR ;
	SBTab[compThis.stat]() ;
	console.log("Exe-Ser-Err") ;
}
function eaExeTmo() {
	clearInterval(hdExecPoll) ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	/* set next FSM and button states */
	compThis.stat = $('#ccBtnExec').data('stat-hist') ;
	SBTab[compThis.stat]() ;
	console.log("Exe-Tmo-"+stateName[compThis.stat]) ;
}
function eaExeTgd() {
	onclickBtnD8N() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Exe-Tgd-D8N") ;
}
function eaExeTgp() {
	onclickBtnP9S() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Exe-Tgp-P9S") ;
}
function eaErrPcd() {
	$('#ccDgFail').modal('toggle') ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	/* set next FSM and button states */
	compThis.stat = $('#ccBtnExec').data('stat-hist') ;
	SBTab[compThis.stat]() ;
	console.log("Err-Pcd-"+stateName[compThis.stat]) ;
}
function eaPolSer(creq) {
	var applog, pdferr ;
	clearInterval(hdExecPoll) ;
	clearTimeout(hdExecPrgs) ;
	clearTimeout(hdExecCanc) ;
	if ($('#ccDgInfo').hasClass('show'))
		$('#ccDgInfo').modal('toggle') ;
	applog = restGetHref(creq.hateoas, 'related', 'Charta Caeli') ;
	if (typeof applog !== 'undefined') {
		$('#ccDgFail .dgfail-poll500').find('.applog a').attr('href', applog) ;
		$('#ccDgFail .dgfail-poll500').find('.applog').removeClass('d-none') ;
	} else
		$('#ccDgFail .dgfail-poll500').find('.applog').addClass('d-none') ;
	pdferr = restGetHref(creq.hateoas, 'related', 'Ghostscript') ;
	if (typeof pdferr !== 'undefined') {
		$('#ccDgFail .dgfail-poll500').find('.pdferr a').attr('href', pdferr) ;
		$('#ccDgFail .dgfail-poll500').find('.pdferr').removeClass('d-none') ;
	} else
		$('#ccDgFail .dgfail-poll500').find('.pdferr').addClass('d-none') ;
	$('#ccDgFail').find('[class ^= dgfail-]').addClass('d-none') ;
	$('#ccDgFail').find('.dgfail-poll500').removeClass('d-none') ;
	$('#ccDgFail').modal('toggle') ;
	/* set next FSM and button states */
	compThis.stat = State.ERR ;
	SBTab[compThis.stat]() ;
	console.log("Pol-Ser-Err") ;
}
function eaPolTmo() {
	console.log("Pol-Tmo-Pol") ;
}
function eaPolPcd(creq) {
	clearInterval(hdExecPoll) ;
	clearTimeout(hdExecPrgs) ;
	clearTimeout(hdExecCanc) ;
	window.open(restGetHref(creq.hateoas, 'next')) ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	/* set next FSM and button states */
	compThis.stat = $('#ccBtnExec').data('stat-hist') ;
	SBTab[compThis.stat]() ;
	console.log("Pol-Pcd-"+stateName[compThis.stat]) ;
}
function eaPolTgd() {
	onclickBtnD8N() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Pol-Tgd-D8N") ;
}
function eaPolTgp() {
	onclickBtnP9S() ;
	/* set button states */
	SBTab[compThis.stat]() ;
	console.log("Pol-Tgp-P9S") ;
}

/* state/ button states table */
var SBTab = Object.freeze([
	function () { // State.EMP
		$('#ccBtnNew').prop('disabled', true) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', true) ;
	},
	function () { // State.OPN
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', false) ;
	},
	function () { // State.CHG
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', false) ;
	},
	function () { // State.WRN
	},
	function () { // State.EXE
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', true) ;
	},
	function () { // State.ERR
	},
	function () { // State.POL
	}
]) ;

/* clear Composer */
function onclickBtnNew() {
	compThis.open = compThis.defdef ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer').offset().top}, 800) ;
}

/* load Composer from gallery */
function onclickBtnLoad() {
	var href, chart, prefs ;
	/* fetch definition */
	href = $('.carousel .active').attr('data-load-chart') ;
	$.ajax({url: href,
		dataType: 'text',
		dataFilter: function (data, type) {return data.replace(/(\r?\n|\r)\s*/g, "")},
		success: function (data) {
			chart = data ;
			compD8N.open = chart ;
			/* fetch preferences */
			href = $('.carousel .active').attr('data-load-prefs') ;
			if (href) {
				$.ajax({url: href,
					dataType: 'text',
					dataFilter: function (data, type) {return data.replace(/(\r?\n|\r)\s*/g, "")},
					success: function (data) {
						prefs = data ;
						compP9S.open = prefs ;
						loadXonomy('#ccXonomy') ;
						compP9S.stat = State.OPN ;
						compD8N.stat = State.OPN ;
						/* set button states */
						SBTab[compThis.stat]() ;
					}}) ;
			} else {
				loadXonomy('#ccXonomy') ;
				compD8N.stat = State.OPN ;
				compP9S.stat = State.EMP ;
				/* set button states */
				SBTab[compThis.stat]() ;
			}
		}
	}) ;
}

/* toggle to preferences button */
function onclickBtnP9S() {
	$('#ccBtnTglP')
	.toggleClass('d-md-block')
	.prop('disabled', true) ;
	$('#ccBtnTglD')
	.toggleClass('d-md-block')
	.prop('disabled', false) ;
	/* save current Composer */
	compThis.open = grabXonomy() ;
	/* toggle runtime state objects */
	compThis = compP9S ;
	compExch = compD8N ;
	/* load Composer from toggled state object */
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
}

/* toggle to definition button */
function onclickBtnD8N() {
	$('#ccBtnTglD')
	.toggleClass('d-md-block')
	.prop('disabled', true) ;
	$('#ccBtnTglP')
	.toggleClass('d-md-block')
	.prop('disabled', false) ;
	/* save current Composer */
	compThis.open = grabXonomy() ;
	/* toggle runtime state objects */
	compThis = compD8N ;
	compExch = compP9S ;
	/* load Composer from toggled state object */
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
}

function onclickBtnOpen() {
	var file = new FileReader() ;
	file.onload = function () {
		compThis.open = this.result.replace(/(\r?\n|\r)\s*/g, "") ;
		loadXonomy('#ccXonomy') ;
		$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
		compThis.stat = State.OPN ;
		/* set button states */
		SBTab[compThis.stat]() ;
	} ;
	file.readAsText($('#ccInpOpen')[0].files[0]) ;
	/* allow to select same file several times in a row (SO #12030686) */ 
	document.getElementById('ccInpOpen').value = null ;
}

function onclickBtnExec() {
	var exec, chart, prefs ;
	hdExecCanc = setTimeout(function () {
		EATab[compThis.stat][Event.TMO]() ;
	}, 30*60*1000) ; /* 30 min */
	/* issue POST */
	compThis.open = grabXonomy() ;
	chart = compD8N.open ;
	prefs = compP9S.open ;
	exec = $('#ccBtnExec').attr('data-rest-api') ;
	$.ajax({
		url: exec,
		method: 'POST',
		data: { chart: chart, prefs: prefs },
		dataType: 'json',
		statusCode: {
			202: function (creq) {EATab[compThis.stat][Event.PCD](creq)},
			400: function (xhr) {EATab[compThis.stat][Event.CER]($.parseJSON(xhr.responseText))},
			500: function (xhr) {EATab[compThis.stat][Event.SER]($.parseJSON(xhr.responseText))}
		}
	}) ;
}

function restGetHref(hateoas, rel, title) {
	var elem ;

	if (typeof title === 'undefined')
		elem = hateoas.find(function (link) {return link.rel == rel}) ;
	else
		elem = hateoas.find(function (link) {return link.rel == rel && link.title.includes(title)}) ;

	if (typeof elem !== 'undefined')
		return elem.href ;
	return elem ;
}

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
	document.querySelector('#ccBtnLoad').addEventListener('click', function () {EATab[compThis.stat][Event.LOD]()}) ;
	document.querySelector('.navbar-toggler').addEventListener('click', btnToggleMenu) ;
	document.querySelector('#ccBtnTglP').addEventListener('click', function () {EATab[compThis.stat][Event.TGP]()}) ;
	document.querySelector('#ccBtnTglD').addEventListener('click', function () {EATab[compThis.stat][Event.TGD]()}) ;
	document.querySelector('#ccBtnNew').addEventListener('click', function () {EATab[compThis.stat][Event.NEW]()}) ;
	document.querySelector('#ccBtnOpen').addEventListener('click', function () {$('#ccInpOpen').focus().trigger('click')}) ;
	document.querySelector('#ccInpOpen').addEventListener('change', function () {EATab[compThis.stat][Event.OPN]()}) ;
	document.querySelector('#ccBtnExec').addEventListener('click', function () {EATab[compThis.stat][Event.EXE]()}) ;
	document.querySelector('#ccDgWarnKey1st').addEventListener('click', function () {EATab[compThis.stat][Event.CNC]()}) ;
	document.querySelector('#ccDgWarnKey2nd').addEventListener('click', function () {EATab[compThis.stat][Event.PCD]()}) ;
	document.querySelector('#ccDgFailKey').addEventListener('click', function () {EATab[compThis.stat][Event.PCD]()}) ;
	document.querySelector('#ccDgInfoKey').addEventListener('click', function () {$('#ccDgInfo').modal('toggle')}) ;
}) ;

/* toggle burger and cross icons */
function btnToggleMenu(event) {
	$(this).find('i').toggleClass('fa-bars fa-times') ;
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
	// enable Load if D8N available
	var load = $('.carousel .active').attr('data-load-chart') ;
	if (load) {
		$('#ccBtnLoad').removeClass('disabled') ;
	} else {
		$('#ccBtnLoad').addClass('disabled') ;
	}
}
