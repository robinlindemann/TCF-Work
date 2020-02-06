({
	doInit: function(component) {
		var vfOrigin = window.location.protocol + "//" + window.location.hostname;
		var currentThis = this;
		//Adds a listener to listen for captcha updates from the nested iframe.
		window.addEventListener("message", event => {
			let test = '';
			if (event.origin === vfOrigin) {
				if (event.data.message) {
					this.handleRecaptchaVerify(component, event.data.message);
				} else if (event.data.expired) {
					this.handleRecaptchaExpiration(component);
				}
			}
		});
	},

	saveApp: function(component) {
		let referrer = this.getUrlParam("referrer");
		var action = component.get("c.saveApp");
		debugger;

		action.setParams({
			app: JSON.stringify(component.get("v.newApp")),
			recTypeDevName: component.get("v.appRecType"),
			googleResponse: component.get("v.reCaptchaMessage"),
			refGuid: referrer,
			pw: component.get('v.password'),
			pwConfirm: component.get('v.passwordConfirm')
		});

		debugger;
		action.setCallback(this, function(response) {
			var state = response.getState();
			debugger;
			if (state === "SUCCESS") {
				debugger;
				//pass password and guid to parent component
				this.fireNewAppEvent(
					component,
					response.getReturnValue(),
					component.get("v.newApp").Password__c
				);
			} else if (state === "INCOMPLETE") {
				console.log("incomplete");
			} else if (state === "ERROR") {
				var errors = response.getError();
				if (errors) {
					if (errors[0] && errors[0].message) {
						console.log("Error message: " + errors[0].message);
					}
				} else {
					console.log("Unknown error");
				}
			}
		});
		$A.enqueueAction(action);
	},

	createApp : function(component) {
		let referrer = this.getUrlParam('referrer');
		var action = component.get('c.createApp');

		action.setParams({
			googleResponse: component.get('v.reCaptchaMessage'),
			fName: component.get('v.newApp.Contact_First_Name__c'),
			lName: component.get('v.newApp.Contact_Last_Name__c'),
			email: component.get('v.newApp.Contact_Email_Address__c'),
			phone: component.get('v.newApp.Contact_Phone__c'),
			pw1: component.get('v.password1'),
			pw2: component.get('v.password2'),
			refGuid: referrer,
			recType: component.get('v.appRecType'),
			gResp: component.get("v.reCaptchaMessage")
		});

		action.setCallback(this, function(response) {
			var state = response.getState();
			debugger;
			if (state === "SUCCESS") {
				//pass password and guid to parent component
				this.fireNewAppEvent(
					component,
					response.getReturnValue(),
					component.get('v.password1')
				);
			} else if (state === "INCOMPLETE") {
				console.log("incomplete");
			} else if (state === "ERROR") {
				var errors = response.getError();
				if (errors) {
					if (errors[0] && errors[0].message) {
						console.log("Error message: " + errors[0].message);
					}
				} else {
					console.log("Unknown error");
				}
			}
		});
		$A.enqueueAction(action);
	},

  fireNewAppEvent: function(component, guid, pw) {
	console.log("in new event");
	var newAppEvent = component.getEvent("newCreditAppEvent");
	  newAppEvent.setParams({
	  guid: guid,
	  password: pw
	});
	  newAppEvent.fire();
  },

  handleRecaptchaVerify: function(component, message) {
	console.log("in verify");
	component.set("v.reCaptchaMessage", message);
	this.hideRecaptcha(component);
	component.set("v.showNext", true);
  },

  handleRecaptchaExpiration: function(component) {
	this.showRecaptcha(component);
	component.set("v.showNext", false);
  },

  hideRecaptcha: function(component) {
	var reCaptcha = component.find("vfFrame");
	$A.util.addClass(reCaptcha, "slds-hide");
  },

  showRecaptcha: function(component) {
	var reCaptcha = component.find("vfFrame");
	$A.util.removeClass(reCaptcha, "slds-hide");
  },

  validatePW: function(component) {
	var pwCmp = component.find("password1");
    var fn = component.get("v.newApp").Contact_First_Name__c;
    var pw = component.get("v.password1");
	var ln = component.get("v.newApp").Contact_Last_Name__c;
	var pwd = "password";
    var cpw = component.get("v.password2");
      

	pwCmp.setCustomValidity("");

	if (pw) {
	  if (fn && pw.toUpperCase().includes(fn.toUpperCase())) {
		pwCmp.setCustomValidity("Please update password - cannot contain first name");
	  } else if (ln && pw.toUpperCase().includes(ln.toUpperCase())) {
		pwCmp.setCustomValidity("Please update password - cannot contain last name");
	  } else if (pw.toUpperCase().includes(pwd.toUpperCase())) {
		pwCmp.setCustomValidity("Please update password - cannot contain the word password");
	  } else if (cpw && pw !== cpw) {
		pwCmp.setCustomValidity("Please enter matching password and confirm password");
	  }
	}
 
	pwCmp.reportValidity();
  },
       

  /* URL PARAMETERS */
  getUrlParam: function(param) {
	let sPageURL = decodeURIComponent(window.location.search.substring(1));
	let sURLVariables = sPageURL.split("&");
	let sParameterName;

	for (let i = 0; i < sURLVariables.length; i++) {
	  sParameterName = sURLVariables[i].split("=");
	  if (sParameterName[0] === param) {
		return sParameterName[1] === undefined
		  ? ""
		  : sParameterName[1].replace(/\+/g, " ");
	  }
	}
	return "";
  }
});
