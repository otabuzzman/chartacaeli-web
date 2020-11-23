// preferences specification object (prototype of statP9S)
var prefsS11N = Object.freeze({
	// mind the D(8N) where P(9S) would seem to make more sense (but actually doesn't)
	id: "#ccBtnTglD",

	// default preferences definition
	defdef: "<preferences EXTERNAL_XML_VERSION='1.0'><root type='user'><map/></root></preferences>",

	// XML declaration and any further required prolog
	XMLdec: "<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE preferences SYSTEM 'http://java.sun.com/dtd/preferences.dtd'>",

	// specification (DTD) transformed to Xonomy
	Xonomy: {
		elements: {
			"entry": {
				menu: [{
					caption: "add \@@key",
					action: Xonomy.newAttribute,
					actionParameter: {name: "key"},
					hideIf: function(jsElement) {
						return jsElement.hasAttribute("key");
					}
				}, {
					caption: "add \@@value",
					action: Xonomy.newAttribute,
					actionParameter: {name: "value"},
					hideIf: function(jsElement) {
						return jsElement.hasAttribute("value");
					}
				}, {
					caption: "@delete",
					action: Xonomy.deleteElement
				}],
				attributes: {
					"key": {
						asker: Xonomy.askString
					},
					"value": {
						asker: Xonomy.askString
					}
				}
			},
			"map": {
				menu: [{
					caption: "add <entry>",
					action: Xonomy.newElementChild,
					actionParameter: "<entry/>",
				}, {
					caption: "@delete",
					action: Xonomy.deleteElement,
					hideIf: function(jsElement) {
						return jsElement.hasElements();
					}
				}]
			},
			"node": {
				menu: [{
					caption: "add \@@name",
					action: Xonomy.newAttribute,
					actionParameter: {name: "name"},
					hideIf: function(jsElement) {
						return jsElement.hasAttribute("name");
					}
				}, {
					caption: "add <map>",
					action: Xonomy.newElementChild,
					actionParameter: "<map/>",
					hideIf: function(jsElement) {
						return jsElement.hasChildElement("map");
					}
				}, {
					caption: "add <node>",
					action: Xonomy.newElementChild,
					actionParameter: "<node/>"
				}, {
					caption: "@delete",
					action: Xonomy.deleteElement,
					hideIf: function(jsElement) {
						return jsElement.hasElements();
					}
				}],
				attributes: {
					"name": {
						asker: Xonomy.askString
					}
				}
			},
			"root": {
				menu: [{
					caption: "add \@@type",
					action: Xonomy.newAttribute,
					actionParameter: {name: "type"},
					hideIf: function(jsElement) {
						return jsElement.hasAttribute("type");
					}
				}, {
					caption: "add <map>",
					action: Xonomy.newElementChild,
					actionParameter: "<map/>",
					hideIf: function(jsElement) {
						return jsElement.hasChildElement("map");
					}
				}, {
					caption: "add <node>",
					action: Xonomy.newElementChild,
					actionParameter: "<node/>"
				}, {
					caption: "@delete",
					action: Xonomy.deleteElement,
					hideIf: function(jsElement) {
						return jsElement.hasElements();
					}
				}],
				attributes: {
					"type": {
						asker: Xonomy.askOpenPicklist,
						askerParameter: [
							{value: "system"},
							{value: "user"}
						]
					}
				}
			},
			"preferences" : {
				menu: [{
					caption: "add \@@EXTERNAL_XML_VERSION",
					action: Xonomy.newAttribute,
					actionParameter: {name: "EXTERNAL_XML_VERSION"},
					hideIf: function(jsElement) {
						return jsElement.hasAttribute("EXTERNAL_XML_VERSION");
					}
				}, {
					caption: "add <root>",
					action: Xonomy.newElementChild,
					actionParameter: "<root/>",
					hideIf: function(jsElement) {
						return jsElement.hasChildElement("root");
					}
				}, {
					caption: "@delete",
					action: Xonomy.deleteElement,
					hideIf: function(jsElement) {
						return jsElement.hasElements();
					}
				}],
				attributes: {
					"EXTERNAL_XML_VERSION": {
						asker: Xonomy.askString,
						menu: [{
							caption: "delete",
							action: Xonomy.deleteAttribute
						}]
					}
				}
			}
		},
		onchange: function() {
		},
		validate: function() {
		}
	}
});
