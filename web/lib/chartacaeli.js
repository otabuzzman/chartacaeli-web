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
			Hstate: {
				value: 0,
				writable: true, enumerable: true, configurable: false
			},
			Hevent: {
				value: 0,
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
	compThis.open = compD8N.XMLdec+compD8N.defdef ;
	/* init preferences state object */
	compP9S = Object.create(prefsS11N, compTmpl) ;
	compExch = compP9S ;
	compExch.open = compP9S.XMLdec+compP9S.defdef ;
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
	var decl, data ;
	var xonDiv = $(id) ;
	if (xonDiv.css('display') === 'none') {
		data = compThis.open ;
	} else {
		data = Xonomy.harvest() ;
	}
	decl = compThis.XMLdec ;
	return decl+data ;
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
const stateName = Object.freeze(["CHG", "EMP", "EXE", "FIN", "OPN", "POL", "USV"]) ;
const State = Object.freeze({CHG: 0, EMP: 1, EXE: 2, FIN: 3, OPN: 4, POL: 5, USV: 6}) ;
/* event enumeration names and values */
const eventName = Object.freeze(["CER", "CHG", "CNC", "EXE", "LOD", "NEW", "OPN", "PCD", "SER", "TGD", "TGP", "TMF", "TMP", "TMU"]) ;
const Event = Object.freeze({CER: 0, CHI: 1, CHG: 2, CNC: 3, EXE: 4, LOD: 5, NEW: 6, OPN: 7, PCD: 8, SER: 9, TGD: 10, TGP: 11, TMF: 12, TMP: 13, TMU: 14}) ;
/* event/ activity table */
const EATab = Object.freeze([
	/* S/ E     Cer       Chi       Chg       Cnc       Exe       Lod       New       Opn       Pcd       Ser       Tgd       Tgp       Tmf       Tmp       Tmu     */
	/* Chg */  [eaReject, eaChgChi, eaChgChg, eaReject, eaChgExe, eaChgLod, eaChgNew, eaChgOpn, eaReject, eaReject, eaChgTgd, eaChgTgp, eaReject, eaReject, eaReject],
	/* Emp */  [eaReject, eaEmpChi, eaEmpChg, eaReject, eaReject, eaEmpLod, eaReject, eaEmpOpn, eaReject, eaReject, eaEmpTgd, eaEmpTgp, eaReject, eaReject, eaReject],
	/* Exe */  [eaExeCer, eaExeChi, eaReject, eaReject, eaReject, eaExeLod, eaReject, eaReject, eaExePcd, eaExeSer, eaReject, eaReject, eaExeTmf, eaReject, eaExeTmu],
	/* Fin */  [eaReject, eaReject, eaFinChg, eaReject, eaReject, eaFinLod, eaFinNew, eaFinOpn, eaFinPcd, eaReject, eaReject, eaReject, eaReject, eaReject, eaReject],
	/* Opn */  [eaReject, eaOpnChi, eaOpnChg, eaReject, eaOpnExe, eaOpnLod, eaOpnNew, eaOpnOpn, eaReject, eaReject, eaOpnTgd, eaOpnTgp, eaReject, eaReject, eaReject],
	/* Pol */  [eaReject, eaPolChi, eaReject, eaReject, eaReject, eaPolLod, eaReject, eaReject, eaPolPcd, eaPolSer, eaReject, eaReject, eaPolTmf, eaPolTmp, eaPolTmu],
	/* Usv */  [eaReject, eaReject, eaReject, eaUsvCnc, eaReject, eaUsvLod, eaUsvNew, eaUsvOpn, eaReject, eaReject, eaReject, eaReject, eaReject, eaReject, eaReject]
	]) ;

/* event activities */
function eaReject() {
	console.log("FSM rejected") ;
}
function eaChgChi() {
	// save state and event
	compThis.Hstate = State.CHG ;
	compThis.Hevent = Event.CHI ;
	// specific actions
	// update FSM
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-CHI-"+stateName[compThis.stat]) ;
}
function eaChgChg() {
	// save state and event
	compThis.Hstate = State.CHG ;
	compThis.Hevent = Event.CHG ;
	// specific actions
	// update FSM
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-CHG-"+stateName[compThis.stat]) ;
}
function eaChgExe() {
	// save state and event
	$('#ccBtnExec').data('Hstate', State.CHG) ;
	$('#ccBtnExec').data('Hevent', Event.EXE) ;
	// specific actions
	oneventEXE() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	// update FSM
	compThis.stat = State.EXE ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-EXE-"+stateName[compThis.stat]) ;
}
function eaChgLod() {
	// save state and event
	$('#ccDgWarnUSV').data('Hstate', State.CHG) ;
	$('#ccDgWarnUSV').data('Hevent', Event.LOD) ;
	// specific actions
	$('#ccDgWarnUSV').modal('toggle') ;
	// update FSM
	compThis.stat = State.USV ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-LOD-"+stateName[compThis.stat]) ;
}
function eaChgNew() {
	// save state and event
	$('#ccDgWarnUSV').data('Hstate', State.CHG) ;
	$('#ccDgWarnUSV').data('Hevent', Event.NEW) ;
	// specific actions
	$('#ccDgWarnUSV').modal('toggle') ;
	// update FSM
	compThis.stat = State.USV ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-NEW-"+stateName[compThis.stat]) ;
}
function eaChgOpn() {
	// save state and event
	$('#ccDgWarnUSV').data('Hstate', State.CHG) ;
	$('#ccDgWarnUSV').data('Hevent', Event.OPN) ;
	// specific actions
	$('#ccDgWarnUSV').modal('toggle') ;
	// update FSM
	compThis.stat = State.USV ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-OPN-"+stateName[compThis.stat]) ;
}
function eaChgTgd() {
	// save state and event
	compThis.Hstate = State.CHG ;
	compThis.Hevent = Event.TGD ;
	// specific actions
	oneventD8N() ;
	// update FSM
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-TGD-"+stateName[compThis.stat]) ;
}
function eaChgTgp() {
	// save state and event
	compThis.Hstate = State.CHG ;
	compThis.Hevent = Event.TGP ;
	// specific actions
	oneventP9S() ;
	// update FSM
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("CHG-TGP-"+stateName[compThis.stat]) ;
}
function eaEmpChi() {
	// save state and event
	compThis.Hstate = State.EMP ;
	compThis.Hevent = Event.CHI ;
	// specific actions
	// update FSM
	compThis.stat = State.EMP ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EMP-CHI-"+stateName[compThis.stat]) ;
}
function eaEmpChg() {
	// save state and event
	compThis.Hstate = State.EMP ;
	compThis.Hevent = Event.CHG ;
	// specific actions
	// update FSM
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EMP-CHG-"+stateName[compThis.stat]) ;
}
function eaEmpLod() {
	// save state and event
	compThis.Hstate = State.EMP ;
	compThis.Hevent = Event.LOD ;
	// specific actions
	oneventLOD() ;
	// update FSM
	// trace FSM
	console.log("EMP-LOD-"+stateName[compThis.stat]+" (update pending)") ;
}
function eaEmpOpn() {
	// save state and event
	$('#ccInpOpen').data('Hstate', State.EMP) ;
	$('#ccInpOpen').data('Hevent', Event.OPN) ;
	// specific actions
	$('#ccInpOpen').focus().trigger('click')
	// update FSM
	compThis.stat = State.FIN ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EMP-OPN-"+stateName[compThis.stat]) ;
}
function eaEmpTgd() {
	// save state and event
	compThis.Hstate = State.EMP ;
	compThis.Hevent = Event.TGD ;
	// specific actions
	oneventD8N() ;
	// update FSM
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EMP-TGD-"+stateName[compThis.stat]) ;
}
function eaEmpTgp() {
	// save state and event
	compThis.Hstate = State.EMP ;
	compThis.Hevent = Event.TGP ;
	// specific actions
	oneventP9S() ;
	// update FSM
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EMP-TGP-"+stateName[compThis.stat]) ;
}
function eaExeCer(creq) {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.CER ;
	// specific actions
	clearTimeout(hdExecCanc) ;
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	if ($('#ccDgInfoFDB').hasClass('show')) {
		$('#ccDgInfoFDB').modal('toggle') ;
	}
	$('#ccDgFailERR .dgfail-CER .creq-info').text(creq.info) ;
	$('#ccDgFailERR').find('[class ^= dgfail-]').addClass('d-none') ;
	$('#ccDgFailERR').find('.dgfail-CER').removeClass('d-none') ;
	$('#ccDgFailERR').modal('toggle') ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	// update FSM
	compThis.stat = $('#ccBtnExec').data('Hstate') ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EXE-CER-"+stateName[compThis.stat]) ;
}
function eaExeChi() {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.CHI ;
	// specific actions
	$('#ccDgWarnDIS').modal('toggle') ;
	// update FSM
	compThis.stat = State.EXE ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EXE-CHI-"+stateName[compThis.stat]) ;
}
function eaExeLod() {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.LOD ;
	// specific actions
	$('#ccDgWarnDIS').modal('toggle') ;
	// update FSM
	compThis.stat = State.EXE ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EXE-LOD-"+stateName[compThis.stat]) ;
}
function eaExePcd(creq) {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.PCD ;
	// specific actions
	var next = restGetHref(creq.hateoas, 'next') ;
	hdExecPoll = setInterval(function () {
		$.ajax({
			url: next,
			method: 'GET',
			headers: { Accept: "application/json" },
			success: function(creq) {
				switch (creq.stat) {
				case 'accepted':
				case 'started':
					EATab[compThis.stat][Event.TMP]() ;
					break ;
				case 'finished':
					EATab[compThis.stat][Event.PCD](creq) ;
					break ;
				case 'failed':
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
		EATab[compThis.stat][Event.TMF]() ;
	}, 15*1000) ; /* 15 sec */
	// update FSM
	compThis.stat = State.POL ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EXE-PCD-"+stateName[compThis.stat]) ;
}
function eaExeSer(creq) {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.SER ;
	// specific actions
	clearTimeout(hdExecCanc) ;
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	if ($('#ccDgInfoFDB').hasClass('show')) {
		$('#ccDgInfoFDB').modal('toggle') ;
	}
	$('#ccDgFailERR .dgfail-EXE-SER .creq-info').text(creq.info) ;
	$('#ccDgFailERR').find('[class ^= dgfail-]').addClass('d-none') ;
	$('#ccDgFailERR').find('.dgfail-EXE-SER').removeClass('d-none') ;
	$('#ccDgFailERR').modal('toggle') ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	// update FSM
	compThis.stat = $('#ccBtnExec').data('Hstate') ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EXE-SER-"+stateName[compThis.stat]) ;
}
function eaExeTmf() {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.TMF ;
	// specific actions
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	$('#ccDgInfoFDB').modal('toggle') ;
	// update FSM
	// trace FSM
	console.log("EXE-TMF-"+stateName[compThis.stat]) ;
}
function eaExeTmu() {
	// save state and event
	compThis.Hstate = State.EXE ;
	compThis.Hevent = Event.TMU ;
	// specific actions
	clearInterval(hdExecPoll) ;
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	if ($('#ccDgInfoFDB').hasClass('show')) {
		$('#ccDgInfoFDB').modal('toggle') ;
	}
	// update FSM
	compThis.stat = $('#ccBtnExec').data('Hstate') ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("EXE-TMU-"+stateName[compThis.stat]) ;
}
function eaFinChg() { // hack to unstuck from State.FIN after click on button cancel of file picker dialog
	EATab[$('#ccInpOpen').data('Hstate')][Event.CHG]()
}
function eaFinLod() { // hack to unstuck from State.FIN after click on button cancel of file picker dialog
	EATab[$('#ccInpOpen').data('Hstate')][Event.LOD]()
}
function eaFinNew() { // hack to unstuck from State.FIN after click on button cancel of file picker dialog
	EATab[$('#ccInpOpen').data('Hstate')][Event.NEW]()
}
function eaFinOpn() { // hack to unstuck from State.FIN after click on button cancel of file picker dialog
	EATab[$('#ccInpOpen').data('Hstate')][Event.OPN]()
}
function eaFinPcd(e) {
	// save state and event
	compThis.Hstate = State.FIN ;
	compThis.Hevent = Event.PCD ;
	// specific actions
	compThis.open = e.target.result.replace(/(\r?\n|\r)\s*/g, " ").replace(/> </g, "><") ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
	// update FSM
	compThis.stat = State.OPN ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("FIN-PCD-"+stateName[compThis.stat]) ;
}
function eaOpnChi() {
	// save state and event
	compThis.Hstate = State.OPN ;
	compThis.Hevent = Event.CHI ;
	// specific actions
	// update FSM
	compThis.stat = State.OPN ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-CHI-"+stateName[compThis.stat]) ;
}
function eaOpnChg() {
	// save state and event
	compThis.Hstate = State.OPN ;
	compThis.Hevent = Event.CHG ;
	// specific actions
	// update FSM
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-CHG-"+stateName[compThis.stat]) ;
}
function eaOpnExe() {
	// save state and event
	$('#ccBtnExec').data('Hstate', State.OPN) ;
	$('#ccBtnExec').data('Hevent', Event.EXE) ;
	// specific actions
	oneventEXE() ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	// update FSM
	compThis.stat = State.EXE ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-EXE-"+stateName[compThis.stat]) ;
}
function eaOpnLod() {
	// save state and event
	compThis.Hstate = State.OPN ;
	compThis.Hevent = Event.LOD ;
	// specific actions
	oneventLOD() ;
	// update FSM
	// trace FSM
	console.log("OPN-LOD-"+stateName[compThis.stat]+" (update pending)") ;
}
function eaOpnNew() {
	// save state and event
	compThis.Hstate = State.OPN ;
	compThis.Hevent = Event.NEW ;
	// specific actions
	oneventNEW() ;
	// update FSM
	compThis.stat = State.EMP ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-NEW-"+stateName[compThis.stat]) ;
}
function eaOpnOpn() {
	// save state and event
	$('#ccInpOpen').data('Hstate', State.OPN) ;
	$('#ccInpOpen').data('Hevent', Event.OPN) ;
	// specific actions
	$('#ccInpOpen').focus().trigger('click')
	// update FSM
	compThis.stat = State.FIN ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-OPN-"+stateName[compThis.stat]) ;
}
function eaOpnTgd() {
	// save state and event
	compThis.Hstate = State.OPN ;
	compThis.Hevent = Event.TGD ;
	// specific actions
	oneventD8N() ;
	// update FSM
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-TGD-"+stateName[compThis.stat]) ;
}
function eaOpnTgp() {
	// save state and event
	compThis.Hstate = State.OPN ;
	compThis.Hevent = Event.TGP ;
	// specific actions
	oneventP9S() ;
	// update FSM
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("OPN-TGP-"+stateName[compThis.stat]) ;
}
function eaPolChi() {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.CHI ;
	// specific actions
	$('#ccDgWarnDIS').modal('toggle') ;
	// update FSM
	compThis.stat = State.POL ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("POL-CHI-"+stateName[compThis.stat]) ;
}
function eaPolLod() {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.LOD ;
	// specific actions
	$('#ccDgWarnDIS').modal('toggle') ;
	// update FSM
	compThis.stat = State.POL ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("POL-LOD-"+stateName[compThis.stat]) ;
}
function eaPolPcd(creq) {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.PCD ;
	// specific actions
	var pdf, ico ;
	pdf = restGetHref(creq.hateoas, 'next') ;
	ico = restGetHref(creq.hateoas, 'related', 'preview') ;
	clearInterval(hdExecPoll) ;
	clearTimeout(hdExecPrgs) ;
	clearTimeout(hdExecCanc) ;
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	if ($('#ccDgInfoFDB').hasClass('show')) {
		$('#ccDgInfoFDB').modal('toggle') ;
	}
	$('#ccDgInfoRDY a').attr('href', pdf) ;
	$('#ccDgInfoRDY img').attr('src', ico) ;
	$('#ccDgInfoRDY').modal('toggle') ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	// update FSM
	compThis.stat = $('#ccBtnExec').data('Hstate') ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("POL-PCD-"+stateName[compThis.stat]) ;
}
function eaPolSer(creq) {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.SER ;
	// specific actions
	var applog, pdferr ;
	applog = restGetHref(creq.hateoas, 'related', 'Charta Caeli') ;
	pdferr = restGetHref(creq.hateoas, 'related', 'Ghostscript') ;
	clearInterval(hdExecPoll) ;
	clearTimeout(hdExecPrgs) ;
	clearTimeout(hdExecCanc) ;
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	if ($('#ccDgInfoFDB').hasClass('show')) {
		$('#ccDgInfoFDB').modal('toggle') ;
	}
	if (typeof applog !== 'undefined') {
		$('#ccDgFailERR .dgfail-POL-SER').find('.applog a').attr('href', applog) ;
		$('#ccDgFailERR .dgfail-POL-SER').find('.applog').removeClass('d-none') ;
	} else
		$('#ccDgFailERR .dgfail-POL-SER').find('.applog').addClass('d-none') ;
	if (typeof pdferr !== 'undefined') {
		$('#ccDgFailERR .dgfail-POL-SER').find('.pdferr a').attr('href', pdferr) ;
		$('#ccDgFailERR .dgfail-POL-SER').find('.pdferr').removeClass('d-none') ;
	} else
		$('#ccDgFailERR .dgfail-POL-SER').find('.pdferr').addClass('d-none') ;
	$('#ccDgFailERR').find('[class ^= dgfail-]').addClass('d-none') ;
	$('#ccDgFailERR').find('.dgfail-POL-SER').removeClass('d-none') ;
	$('#ccDgFailERR').modal('toggle') ;
	$('#ccBtnExec').find('i, span').toggleClass('d-none') ;
	// update FSM
	compThis.stat = $('#ccBtnExec').data('Hstate') ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("POL-SER-"+stateName[compThis.stat]) ;
}
function eaPolTmf() {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.TMF ;
	// specific actions
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	$('#ccDgInfoFDB').modal('toggle') ;
	// update FSM
	// trace FSM
	console.log("POL-TMF-"+stateName[compThis.stat]) ;
}
function eaPolTmp() {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.TMP ;
	// specific actions
	// update FSM
	compThis.stat = State.POL ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("POL-TMP-"+stateName[compThis.stat]) ;
}
function eaPolTmu() {
	// save state and event
	compThis.Hstate = State.POL ;
	compThis.Hevent = Event.TMU ;
	// specific actions
	clearInterval(hdExecPoll) ;
	if ($('#ccDgWarnDIS').hasClass('show')) {
		$('#ccDgWarnDIS').modal('toggle') ;
	}
	if ($('#ccDgInfoFDB').hasClass('show')) {
		$('#ccDgInfoFDB').modal('toggle') ;
	}
	// update FSM
	compThis.stat = $('#ccBtnExec').data('Hstate') ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("POL-TMU-"+stateName[compThis.stat]) ;
}
function eaUsvCnc() {
	// save state and event
	compThis.Hstate = State.USV ;
	compThis.Hevent = Event.CNC ;
	// specific actions
	// update FSM
	compThis.stat = State.CHG ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("USV-CNC-"+stateName[compThis.stat]) ;
}
function eaUsvLod() {
	// save state and event
	compThis.Hstate = State.USV ;
	compThis.Hevent = Event.LOD ;
	// specific actions
	oneventLOD() ;
	// update FSM
	// trace FSM
	console.log("USV-LOD-"+stateName[compThis.stat]+" (update pending)") ;
}
function eaUsvNew() {
	// save state and event
	compThis.Hstate = State.USV ;
	compThis.Hevent = Event.NEW ;
	// specific actions
	oneventNEW() ;
	// update FSM
	compThis.stat = State.EMP ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("USV-NEW-"+stateName[compThis.stat]) ;
}
function eaUsvOpn() {
	// save state and event
	$('#ccInpOpen').data('Hstate', $('#ccDgWarnUSV').data('Hstate')) ;
	$('#ccInpOpen').data('Hevent', $('#ccDgWarnUSV').data('Hevent')) ;
	// specific actions
	$('#ccInpOpen').focus().trigger('click')
	// update FSM
	compThis.stat = State.FIN ;
	SBTab[compThis.stat]() ;
	// trace FSM
	console.log("USV-OPN-"+stateName[compThis.stat]) ;
}

/* state/ button states table */
var SBTab = Object.freeze([
	function () { // State.CHG
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', false) ;
		$(compThis.id).prop('disabled', false) ;
	},
	function () { // State.EMP
		$('#ccBtnNew').prop('disabled', true) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', true) ;
		$(compThis.id).prop('disabled', false) ;
	},
	function () { // State.EXE
		$('#ccBtnNew').prop('disabled', true) ;
		$('#ccBtnOpen').prop('disabled', true) ;
		$('#ccBtnExec').prop('disabled', true) ;
		$(compThis.id).prop('disabled', true) ;
	},
	function () { // State.FIN
	},
	function () { // State.OPN
		$('#ccBtnNew').prop('disabled', false) ;
		$('#ccBtnOpen').prop('disabled', false) ;
		$('#ccBtnExec').prop('disabled', false) ;
		$(compThis.id).prop('disabled', false) ;
	},
	function () { // State.POL
	},
	function () { // State.USV
	}
]) ;

/* clear Composer */
function oneventNEW() {
	compThis.open = compThis.defdef ;
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer').offset().top}, 800) ;
}

/* load Composer from gallery */
function oneventLOD() {
	var href, chart, prefs ;
	/* fetch definition */
	href = $('.carousel .active').attr('data-load-chart') ;
	$.ajax({url: href,
		dataType: 'text',
		dataFilter: function (data, type) {return data.replace(/(\r?\n|\r)\s*/g, " ").replace(/> </g, "><")},
		success: function (data) {
			chart = data ;
			compD8N.open = chart ;
			/* fetch preferences */
			href = $('.carousel .active').attr('data-load-prefs') ;
			if (href) {
				$.ajax({url: href,
					dataType: 'text',
					dataFilter: function (data, type) {return data.replace(/(\r?\n|\r)\s*/g, " ").replace(/> </g, "><")},
					success: function (data) {
						prefs = data ;
						compP9S.open = prefs ;
						loadXonomy('#ccXonomy') ;
						// update FSM
						compP9S.stat = State.OPN ;
						compD8N.stat = State.OPN ;
						SBTab[compThis.stat]() ;
					}}) ;
			} else {
				loadXonomy('#ccXonomy') ;
				// update FSM
				compD8N.stat = State.OPN ;
				compP9S.stat = State.EMP ;
				SBTab[compThis.stat]() ;
			}
		}
	}) ;
}

/* toggle to preferences button */
function oneventP9S() {
	$('#ccBtnTglP')
	.toggleClass('d-none')
	.prop('disabled', true) ;
	$('#ccBtnTglD')
	.toggleClass('d-none')
	.prop('disabled', false) ;
	/* save current Composer */
	compThis.open = grabXonomy('#ccXonomy') ;
	/* toggle runtime state objects */
	compThis = compP9S ;
	compExch = compD8N ;
	/* load Composer from toggled state object */
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
}

/* toggle to definition button */
function oneventD8N() {
	$('#ccBtnTglD')
	.toggleClass('d-none')
	.prop('disabled', true) ;
	$('#ccBtnTglP')
	.toggleClass('d-none')
	.prop('disabled', false) ;
	/* save current Composer */
	compThis.open = grabXonomy('#ccXonomy') ;
	/* toggle runtime state objects */
	compThis = compD8N ;
	compExch = compP9S ;
	/* load Composer from toggled state object */
	loadXonomy('#ccXonomy') ;
	$('html, body').animate({scrollTop: $('#ccComposer .btn-box').offset().top-400}, 800) ;
}

function oneventEXE() {
	var exec, chart, prefs ;
	hdExecCanc = setTimeout(function () {
		EATab[compThis.stat][Event.TMP]() ;
	}, 30*60*1000) ; /* 30 min */
	/* issue POST */
	compThis.open = grabXonomy('#ccXonomy') ;
	chart = compD8N.open ;
	prefs = compP9S.open ;
	exec = $('#ccBtnExec').attr('data-rest-api') ;
	$.ajax({
		url: exec,
		method: 'POST',
		headers: { Accept: "application/json" },
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

	if (typeof title === 'undefined') {
		elem = hateoas.find(function (link) {return link.rel == rel}) ;
	} else {
		elem = hateoas.find(function (link) {return link.rel == rel && link.title.includes(title)}) ;
	}

	if (typeof elem !== 'undefined') {
		return elem.href ;
	}
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
	document.querySelector('#ccBtnOpen').addEventListener('click', function () {EATab[compThis.stat][Event.OPN]()}) ;
	/* make input element fire on change event even if same file picked (SO #12030686) */
	document.querySelector('#ccInpOpen').addEventListener('click', function () {this.value = null}) ;
	document.querySelector('#ccInpOpen').addEventListener('change', function () {var file = new FileReader() ; file.onload = function (e) {EATab[compThis.stat][Event.PCD](e)} ; file.readAsText(this.files[0])}) ;
	document.querySelector('#ccXonomy').addEventListener('click', function () {EATab[compThis.stat][Event.CHI]()}) ;
	document.querySelector('#ccBtnExec').addEventListener('click', function () {EATab[compThis.stat][Event.EXE]()}) ;
	document.querySelector('#ccDgInfoRDY .ccDg1WayKey').addEventListener('click', function () {$('#ccDgInfoRDY').modal('toggle')}) ;
	document.querySelector('#ccDgWarnUSV .ccDg2Way1st').addEventListener('click', function () {EATab[compThis.stat][$('#ccDgWarnUSV').data('Hevent')]()}) ;
	document.querySelector('#ccDgWarnUSV .ccDg2Way2nd').addEventListener('click', function () {EATab[compThis.stat][Event.CNC]()}) ;
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
