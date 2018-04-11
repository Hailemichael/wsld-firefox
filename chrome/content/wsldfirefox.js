/*
 * WebSite security Level Displayer for Average Users
 * Author: Nigatu, Hailemichael Girma 
 */

var objwsldfirefox = {

	// onLoad function that run when page loads	
   onLoad: function() {
	   
     const ci = Components.interfaces;
     const cc = Components.classes;
     const gb = window.getBrowser();    
     
     var wsldfirefoxListener = {
       onStateChange:    function(aWebProgress, aRequest, aFlag, aStatus) { objwsldfirefox.updateChange(); },
       onLocationChange: function(aWebProgress, aRequest, aURI) { objwsldfirefox.updateChange(); },
       onSecurityChange: function(aWebProgress, aRequest, aState) { objwsldfirefox.updateChange(); },
       onStatusChange: function(aWebProgress) { return; },
       onProgressChange: function(aWebProgress) { return; }
     };

       gb.addProgressListener(wsldfirefoxListener);
    },

    
    //update security info when there is a change in security, state or location
   updateChange: function() {
     // global constants
     const cc = Components.classes;
     const ci = Components.interfaces;
     const gb = window.getBrowser();
    
     var currentBrowser = gb.selectedBrowser;
     var ui = currentBrowser.securityUI;
     var insecureSSL = (ui.state & ci.nsIWebProgressListener.STATE_IS_INSECURE);
     var urlProtocol = window.content.location.protocol;
     
     var DomainMismatch = false;
     var WeakSignatureAlgorithm = false;
     
     var symetricCipher = "";
     var symetricKeyLength = "";
     
	 var subjectCountry = "";
	 var subjectOrganization = "";
	 var subjectOrgCountry = "";
	 
	 var wsldfirefoxResult = 0;
	 
     
     var images = [];
     var links = [];
	 var scripts = [];
	 
	 var MACAlgorithm = "";
	
	 
	 // Initialize the Popup panel content
	 var websiteHostName = "";
	 websiteHostName = window.content.location.hostname;
     var certCommonName = "";
     var encryptionAlgorithm = "";
     var keyExchangeAlgorithm = "";
     var encryptionKeyLength = 0;
     
     document.getElementById("WSLDPopupGeneralHostName").value = "Host Name is Empty ! Please Enter Website Adress.";
     document.getElementById("WSLDPopupGeneralTotalScore").value = "0 %";
     document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website DO NOT use any security implementation. All the page content is NOT encrypted. Therefore, ";
     document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "all contents might be seen on transit ! NOT RECOMENDED TO INSERT SENSITIVE INFORMATION ON THIS PAGE !!!";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains NEITHER OF";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "Norton SECURED";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = ", ";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "McAfee SECURE";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = " and ";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "TRUSTe";
     document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmarks. ";
     document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "Click for their respective meaning.";
     document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "";
     document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "";
     
     document.getElementById("WSLDPopupCertificateAvailability").value = "";
     document.getElementById("WSLDPopupCertificateCommonName").value = "";
     document.getElementById("WSLDPopupCertificateCommonNameDomainMisMatch").value = "";
     document.getElementById("WSLDPopupCertificateValidation").value = "The website uses HTTP connection and its identity is not verified	! But other pages";
     document.getElementById("WSLDPopupCertificateValidation2").value = "in this domain may be secured by SSL.";
     document.getElementById("WSLDPopupCertificateAvailabilityScore").value = "0/50";
     document.getElementById("WSLDPopupCertificateCommonNameScore").value = ""; //////////// May be not needed, I have 5% score to distribute to others
     document.getElementById("WSLDPopupCertificateValidationScore").value = "0/10";
     
     document.getElementById("WSLDPopupKeyExchangePrivateKey").value = "0 bits (No Private Key for Authentication and/or Key Exchange !)";
     document.getElementById("WSLDPopupKeyExchangePFS").value = "Perfect Forward Secracy(PFS) NOT IMPLEMENTED (NO Key Exchange Performed) !";
     document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "0/7.5";
     document.getElementById("WSLDPopupKeyExchangePFSScore").value = "0/7.5";
     
     document.getElementById("WSLDPopupEncryptionKeyLength").value = encryptionKeyLength + " bits (Page NOT Encrypted !)";
     document.getElementById("WSLDPopupEncryptionKeyLengthScore").value = "0/20";
	
     
// Initialize Toolbar components     
     document.getElementById("securityicon").src="chrome://wsldfirefox/skin/globe.png";
     document.getElementById("organization").value = "";
     document.getElementById("WSLDFirefoxProgressmeter").value = wsldfirefoxResult;
     document.getElementById("WSLDFirefoxDescription").value = "0%";
     document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/nosecurity.gif";
     
     var trusteTrustmarkimage = document.getElementById("TRUSTeimage");
     trusteTrustmarkimage.src= "";
     var mcafeeTrustmarkimage = document.getElementById("McAfeeSecureimage");
     mcafeeTrustmarkimage.src= "";
     var nortonTrustmarkimage = document.getElementById("NORTONSECUREimage");
     nortonTrustmarkimage.src= "";
     
     document.getElementById("McAfeeSecureimageLabel").value = "";
     document.getElementById("McAfeeSecureimageDate").value = "";
     
     //document.getElementById("NotificationArrow").src = "";
     //document.getElementById("VerifyNotification").src = "";

     
// Initialize Trustmark Variables     
     var foundTRUSTe = false; // may be helpful in adding and removing click event listener, although it becomes impossible until now
     var foundMcAfee = false;
     var foundNorton = false;
     
     var trusteEventListener;
     var mcafeeEventListener;
     var nortonEventListener;
     var nortonEventListenerscript;
     
     trusteTrustmarkimage.removeEventListener('click', trusteEventListener, false);
     mcafeeTrustmarkimage.removeEventListener('click', mcafeeEventListener, false);
     nortonTrustmarkimage.removeEventListener('click', nortonEventListener, false);
     
     // Check Images, obtain links, check if they contain required TrustMarks and set TrustMark
     images = currentBrowser.contentDocument.getElementsByTagName("img");
     links = currentBrowser.contentDocument.getElementsByTagName("a");
     var HostName = websiteHostName.toString();
     
     for (var i = 0; i < links.length; i++){
    	 
    		 var linkhref = "";
    		 linkhref = links[i].href.toString();
    		
    		 if(linkhref.toLowerCase().contains("clicktoverify.truste.com/pvr.php?page=validate&url=") || 
    				 linkhref.toLowerCase().contains("www.truste.org/ivalidate.php?url=") || 
    				 linkhref.toLowerCase().contains("privacy.truste.com/privacy-seal/") || 
    				 linkhref.toLowerCase().contains("privacy.truste.com/privacy-policy/") || 
    				 linkhref.toLowerCase().contains("privacy-policy.truste.com/click-to-verify/")){
    			 foundTRUSTe = true;
    			 var trustlink = "";
    			 trustlink = linkhref;   
    			 //alert("Truste Image  " + trustlink);
    			 linkhref = "";
    			 trusteTrustmarkimage.src="chrome://wsldfirefox/skin/truste.png";
    			 //document.getElementById("NotificationArrow").src = "chrome://wsldfirefox/skin/arrow-left.png";
    			 //document.getElementById("VerifyNotification").src = "chrome://wsldfirefox/skin/clicktoverify.png";
        		 
        		 trusteEventListener = function () {
        			 if(trustlink != ""){
        				 gBrowser.selectedTab = gBrowser.addTab(trustlink);
        				 trustlink = "";
        			 }
           		 
        		 }; 
        		 
        		 trusteTrustmarkimage.addEventListener('click', trusteEventListener, false);
        		  
    		}
    		 // McAfee links should be written as they are to avoid redirection problem
    		 if(linkhref.contains("www.scanalert.com/RatingVerify?ref=") || 
    				 linkhref.contains("www.mcafeesecure.com/RatingVerify?ref=")){
    			 foundMcAfee = true;
    			 var mcafeelink = "";
    			 mcafeelink = linkhref;   
    			 //alert("McAfee Secure Image  " + mcafeelink);
    			 linkhref = "";
    			 mcafeeTrustmarkimage.src="chrome://wsldfirefox/skin/mcafee.gif";
    			 //document.getElementById("NotificationArrow").src = "chrome://wsldfirefox/skin/arrow-left.png";
    			 //document.getElementById("VerifyNotification").src = "chrome://wsldfirefox/skin/clicktoverify.png";
        		 var mcafeeDate = "";
        		 var currDate = new Date();
        		 var date = currDate.getDate();
        		 var month = currDate.getMonth();
        		 var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        		 mcafeeDate = date + "-" + months[month];
    			 document.getElementById("McAfeeSecureimageLabel").value = "TESTED";
    		     document.getElementById("McAfeeSecureimageDate").value = mcafeeDate;
    			 
        		 mcafeeEventListener = function () {
        			 if(mcafeelink != ""){
        				 gBrowser.selectedTab = gBrowser.addTab(mcafeelink); 
        				 mcafeelink = "";
        			 }
        		 };
        		 
        		 mcafeeTrustmarkimage.addEventListener('click', mcafeeEventListener, false);
        		
        	 }
    		 
    		 if(linkhref.toLowerCase().contains("trustsealinfo.verisign.com/splash?form_file=fdf/splash.fdf&dn=") || 
    				 linkhref.toLowerCase().contains("seal.verisign.com/splash?form_file=fdf")){
    			 																			
    			 foundNorton = true; 
    			 var nortonlink = "";
    			 nortonlink = linkhref;    
    			 //alert("Norton Secured Image  " + nortonlink);
    			 linkhref = "";
    			 nortonTrustmarkimage.src = "chrome://wsldfirefox/skin/norton.png";
    			 //document.getElementById("NotificationArrow").src = "chrome://wsldfirefox/skin/arrow-left.png";
    			 //document.getElementById("VerifyNotification").src = "chrome://wsldfirefox/skin/clicktoverify.png";
        		 
        		 nortonEventListener = function () {
        			 
        			 if(nortonlink != ""){
        			 gBrowser.selectedTab = gBrowser.addTab(nortonlink);
        			 nortonlink = "";
        			 }
            		 
        	     };
        		 
        	     nortonTrustmarkimage.addEventListener('click', nortonEventListener, false);
        		 
        	 }
             
     }
     
     delete links;
     
     for (var i = 0; i < images.length; i++){
    	 
    	 
		 if(images[i].hasAttribute("onclick")){
			 var onclicklink = "";
			 onclicklink = images[i].onclick.toString().toLowerCase();
			 
			 if(onclicklink.contains("trustsealinfo.verisign.com/splash?form_file=fdf/splash.fdf&dn=")){
				 foundNorton = true;
				 //alert("onclick found   " + onclicklink);
				 var nortonlinkonclick = "";
				 nortonlinkonclick = "https://trustsealinfo.verisign.com/splash?form_file=fdf/splash.fdf&dn=" + HostName + "&lang=en";
				 onclicklink = "";
				 nortonTrustmarkimage.src = "chrome://wsldfirefox/skin/norton.png";
				 
				 nortonEventListener = function () {
        			 if(nortonlinkonclick != ""){
        				 gBrowser.selectedTab = gBrowser.addTab(nortonlinkonclick);
        				 nortonlinkonclick = "";
        			 }
           		 
        		 }; 
        		 
        		 nortonTrustmarkimage.addEventListener('click', nortonEventListener, false);
			 }
		 }

 	 
    	
     }
     
     delete images;
     
     /*Obtain script tags and check source for availability of NortonSECURE TrustMark
      * Note: Since the script that contains NortonSECURE link is external script only the source of the script is checked
      * if it contains "https://seal.verisign.com/getseal?host_name=" and the general link that contains the corresponding
      * domain name is embedded in the TrustMark.
      */    
     scripts = currentBrowser.contentDocument.getElementsByTagName("script"); // doesn't work for http://www.travelguard.com/
     
     for (var i = 0; i < scripts.length; i++){
    	 
    	 var nortonscriptlink = "";
		 nortonscriptlink = scripts[i].src.toLowerCase();
    	 
    	 if(nortonscriptlink.contains("seal.verisign.com/getseal?host_name=") ||
    			 nortonscriptlink.contains("trustseal.verisign.com/getseal?host_name=")){
    		 foundNorton = true;
    		 nortonTrustmarkimage.src = "chrome://wsldfirefox/skin/norton.png";
    		 //document.getElementById("NotificationArrow").src = "chrome://wsldfirefox/skin/arrow-left.png";
			 //document.getElementById("VerifyNotification").src = "chrome://wsldfirefox/skin/clicktoverify.png";
    		 //alert("Norton Script Src:  " +nortonscriptlink);
    		
    		 
    		 nortonEventListenerscript = function () {
    			 
    			
    			 gBrowser.selectedTab = gBrowser.addTab("https://trustsealinfo.verisign.com/splash?form_file=fdf/splash.fdf&dn=" + HostName + "&lang=en");
    				 domainName = "";
    		
        		 
    	     };
    	     
    	     nortonTrustmarkimage.addEventListener('click', nortonEventListenerscript, false);
    	    
    		 //var scripthtml = scripts[i].innerHTML;
    		 //alert(scripts[i].src); 
    	     // since the script is not embeded one but rather external script, this method is not working
    	 }
     }
     delete scripts;
     
     // remove all duplicate tabs using the url and title
     a:for (var i = 0; i < gBrowser.tabContainer.childNodes.length; i++) {
    	  for (var j = 0; j < gBrowser.tabContainer.childNodes.length; j++) {
    	    var m = gBrowser.tabContainer.childNodes[i].linkedBrowser.currentURI.spec;
    	    var n = gBrowser.tabContainer.childNodes[j].linkedBrowser.currentURI.spec;
    	    var x = gBrowser.tabContainer.childNodes[i].linkedBrowser.contentDocument.title;
    	    var y = gBrowser.tabContainer.childNodes[j].linkedBrowser.contentDocument.title;
    	    if (i != j && j != gBrowser.tabContainer.selectedIndex && m == n && x == y) {
    	      gBrowser.removeTab(gBrowser.tabContainer.childNodes[j]);
    	      i = i - 1; continue a;
    	    }
    	  }
    	}
     
     
     
     // Write host name on the panel
     if(!(websiteHostName == "")){
    	 document.getElementById("WSLDPopupGeneralHostName").value = websiteHostName;
     }
     
     
     // Write Trustmark information on the panel
     if (foundTRUSTe && foundMcAfee && foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "Norton SECURED";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = ", ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "McAfee SECURE";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = " and ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "TRUSTe";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmarks. Click for their";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "respective meaning. [VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("TRUSTeimage");
     }else if (!foundTRUSTe && foundMcAfee && foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "Norton SECURED";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = " and ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "McAfee SECURE";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmarks. Click for their respective";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "meaning. [VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("McAfeeSecureimage");
     }else if (foundTRUSTe && !foundMcAfee && foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "Norton SECURED";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = " and ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "TRUSTe";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmarks. Click for their respective ";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "meaning. [VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("TRUSTeimage");
     }else if (foundTRUSTe && foundMcAfee && !foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "McAfee SECURE";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = " and ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "TRUSTe";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmarks. Click for their respective";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "meaning. [VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("TRUSTeimage");
     }else if (!foundTRUSTe && !foundMcAfee && foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains only ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "Norton SECURED";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmark. Click on the link for its meaning.";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "[VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("NORTONSECUREimage");
     }else if (!foundTRUSTe && foundMcAfee && !foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains only ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "McAfee SECURE";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmark. Click on the link for its meaning.";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "[VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("McAfeeSecureimage");
     }else if (foundTRUSTe && !foundMcAfee && !foundNorton){
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains only ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = "";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "TRUSTe";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmark. Click on the link for its meaning.";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "[VERY IMPORTANT: Never trust the Trustmarks without verifying their genuinity by";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "clicking on the respective logos found on the security toolbar ! ]";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "How to verify Trustmarks ?";
         objwsldfirefox.ViewNotifyPanelTrustmark ("TRUSTeimage");
     }else {
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityBegin").value = "The WebPage contains NEITHER OF";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityNorton").value = "Norton SECURED";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAndComma").value = ", ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityMcAfee").value = "McAfee SECURE";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityAnd").value = " and ";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityTRUSTe").value = "TRUSTe";
    	 document.getElementById("WSLDPopupGeneralTrustmarkAvailabilityEnd").value = " Trustmarks. ";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning1").value = "Click for their respective meaning.";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning2").value = "";
         document.getElementById("WSLDPopupGeneralTrustmarkMeaning3").value = "";
     }
    
     
     // https ssl connections
     if (urlProtocol == "https:") {
    	 
 
    	 
      // collect the certificate information
      if (ui && !insecureSSL)  {
          ui.QueryInterface(ci.nsISSLStatusProvider);
          var status = ui.SSLStatus;
          if (!status) return;
          var sslServerCert = status.serverCert;
          if (!(sslServerCert)) return;
          var certValidityPeriod = sslServerCert.validity.QueryInterface(ci.nsIX509CertValidity);
          if (status && !insecureSSL) {
             status.QueryInterface(ci.nsISSLStatus);
      }
       
          if(sslServerCert){
        	  if (!(ui.state & ci.nsIWebProgressListener.STATE_IS_BROKEN)){
        		  wsldfirefoxResult += 50;
            	  document.getElementById("WSLDPopupCertificateAvailability").value = "The connection to this website is SECURED by use of SSL certificate.";
         	      document.getElementById("WSLDPopupCertificateAvailabilityScore").value = "50/50";
         	      }else{
         	    	  wsldfirefoxResult += 10;
         	    	  document.getElementById("WSLDPopupCertificateAvailability").value = "The connection to this website is ONLY PARTIALLY SECURED by use of SSL certificate !";
         	    	  document.getElementById("WSLDPopupCertificateAvailabilityScore").value = "10/50 !";
         	      }
        	  // Set certificate common name
              certCommonName = sslServerCert.commonName;
              document.getElementById("WSLDPopupCertificateCommonName").value = certCommonName;
          }else{
        	  wsldfirefoxResult += 0;
        	  document.getElementById("WSLDPopupCertificateAvailability").value = "NO, the connection to this website is NOT SECURED by use of SSL certificate.";
     	      document.getElementById("WSLDPopupCertificateAvailabilityScore").value = "0/50";
          }
       
         
      } 

      
       // Cipher Suite and Encryption Key Length
       if (status instanceof ci.nsISSLStatus) {
          symetricCipher = status.cipherName;
          symetricKeyLength = status.secretKeyLength;
          
       }
       
      
       
       

       if (symetricCipher && symetricKeyLength ) {
    	   
    	   

      // get extended certificate information
      var serverCert = status.serverCert;
      
      if (serverCert instanceof ci.nsIX509Cert) {
        var certDetail = cc["@mozilla.org/security/nsASN1Tree;1"].createInstance(ci.nsIASN1Tree);
        certDetail.loadASN1Structure(serverCert.ASN1Structure);
        
        // Subject public key length = private key length used in authentication and may be in key exchange
        var subjectPublicKeyAlgorithm = certDetail.getDisplayData(11).replace(/PKCS #1/g,'').replace(/Encryption/g,'');
        var subjectPublicKeyLengthString = certDetail.getDisplayData(12).split(" ")[1].replace(/\(/g,'');
        var publicKeyLength = parseInt(subjectPublicKeyLengthString);
        
        // update wsld score based on public key length
        if (publicKeyLength >= 4096){
        	wsldfirefoxResult += 7.5;
        	document.getElementById("WSLDPopupKeyExchangePrivateKey").value = publicKeyLength + " bits ("+ subjectPublicKeyAlgorithm +" Peer Authentication Algorithm)";
        	document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "7.5/7.5";
        }else if (2048 <= publicKeyLength < 4096){
        	wsldfirefoxResult += 6.75;
        	document.getElementById("WSLDPopupKeyExchangePrivateKey").value = publicKeyLength + " bits ("+ subjectPublicKeyAlgorithm +" Peer Authentication Algorithm)";
        	document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "6.75/7.5";
        }else if (1024 <= publicKeyLength < 2048){
        	wsldfirefoxResult += 6;
        	document.getElementById("WSLDPopupKeyExchangePrivateKey").value = publicKeyLength + " bits ("+ subjectPublicKeyAlgorithm +" Peer Authentication Algorithm)";
        	document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "6/7.5";
        }else if (512 <= publicKeyLength < 1024){
        	wsldfirefoxResult += 3;
        	document.getElementById("WSLDPopupKeyExchangePrivateKey").value = publicKeyLength + " bits ("+ subjectPublicKeyAlgorithm +" Peer Authentication Algorithm)";
        	document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "3/7.5";
        }else if (0 < publicKeyLength < 512){
        	wsldfirefoxResult += 1.5;
        	document.getElementById("WSLDPopupKeyExchangePrivateKey").value = publicKeyLength + " bits ("+ subjectPublicKeyAlgorithm +" Peer Authentication Algorithm)";
        	document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "1.5/7.5";
        }else{
        	wsldfirefoxResult += 0;
        	document.getElementById("WSLDPopupKeyExchangePrivateKey").value = publicKeyLength + " bits ("+ subjectPublicKeyAlgorithm +" Peer Authentication Algorithm)";
        	document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "0/7.5";
        }

        
        // Subjects organization name and country
        subjectOrganization = serverCert.organization;
        var subjectInfo = certDetail.getDisplayData(9).split("\n");
        for( i=0; i < subjectInfo.length; i++ ) {
            if (subjectInfo[i].substring(0,3) == "C =") {
            	subjectCountry = subjectInfo[i].replace(/C = /g,''); 
            }
         }
        subjectOrgCountry = subjectOrganization + " (" + subjectCountry + ") ";
        
     // Check State Identity flag and State security flags to determine Existing Firefox indicators and certificate validation
        if (ui.state & ci.nsIWebProgressListener.STATE_IDENTITY_EV_TOPLEVEL) {
     	   wsldfirefoxResult += 10;
     	   // Set green lock icon and verystrong logo
            document.getElementById("securityicon").src="chrome://wsldfirefox/skin/lock_green.png";
            document.getElementById("organization").value = subjectOrgCountry;
            
            document.getElementById("WSLDPopupCertificateValidation").value = "The website is identified by Extended Validated (EV) SSL certificate, which implies,";
            document.getElementById("WSLDPopupCertificateValidation2").value = "strong checking IS performed to verify the website OWNER";
            document.getElementById("WSLDPopupCertificateValidationScore").value = "10/10";
            objwsldfirefox.setSecurityLevel (wsldfirefoxResult);
        }else if (ui.state & ci.nsIWebProgressListener.STATE_IS_SECURE) {
     	   // Set lock icon and strong logo
            document.getElementById("securityicon").src="chrome://wsldfirefox/skin/lock.png";
            
            document.getElementById("WSLDPopupCertificateValidation").value = "The website is identified by Domain/Organization Validated (DV/OV) SSL certificate,";
            document.getElementById("WSLDPopupCertificateValidation2").value = "which implies, strong checking IS NOT performed to verify the website OWNER !";
            document.getElementById("WSLDPopupCertificateValidationScore").value = "0/10";
            objwsldfirefox.setSecurityLevel (wsldfirefoxResult);
        }else if (ui.state & ci.nsIWebProgressListener.STATE_IS_BROKEN) {
     	   	
     			  
     		  document.getElementById("securityicon").src="chrome://wsldfirefox/skin/yellow_warning.png";
     	          	      
     	      document.getElementById("WSLDPopupCertificateValidation").value = "The website is identified by Domain/Organization Validated (DV/OV) SSL certificate,";
     	      document.getElementById("WSLDPopupCertificateValidation2").value = "which implies, strong checking IS NOT performed to verify the website OWNER !";
     	      document.getElementById("WSLDPopupCertificateValidationScore").value = "0/10";
     	      objwsldfirefox.setSecurityLevel (wsldfirefoxResult);
     	  }
        
       
    }

//Encryption and Key Exchange Algorithm
      
      var cipherArray = [];
      var WITHindex = 0;
      var SHAindex = 0;
      cipherArray = symetricCipher.split("_");
      
      
      for(var i = 0; i < cipherArray.length; i++){
    	  if(cipherArray[i].contains("WITH")){
    		  WITHindex = i;
    	  }
    	  
    	  if(cipherArray[i].contains("SHA") || cipherArray[i].contains("MD5") || cipherArray[i].contains("MD2")){
    		  SHAindex = i;
    		  MACAlgorithm = cipherArray[i];
    	  }
      }
      
      
      var encriptionAlg = "";
      for(var i = WITHindex +1; i < SHAindex; i++){
    	  encriptionAlg += cipherArray[i] + "_";
      }
      
      encryptionAlgorithm = encriptionAlg.substring(0,((encriptionAlg.length)-1));
      
      var keyExchangeAlg = "";
      for(var i = 1; i < WITHindex; i++){
    	  keyExchangeAlg += cipherArray[i] + "_";
      }
      
      keyExchangeAlgorithm = keyExchangeAlg.substring(0,((keyExchangeAlg.length)-1));
      
      
    
      
//Encryption Key length  
      
      encryptionKeyLength = parseInt(symetricKeyLength); 
      // if statement to compare encryption key length
      if(encryptionKeyLength >= 256){
    	  wsldfirefoxResult += 20;
    	  document.getElementById("WSLDPopupEncryptionKeyLength").value = encryptionKeyLength + " bits" + " (" + encryptionAlgorithm + " Encryption Algorithm)";
    	  document.getElementById("WSLDPopupEncryptionKeyLengthScore").value = "20/20";
      }else if(128 <= encryptionKeyLength < 256){
    	  wsldfirefoxResult += 16;
    	  document.getElementById("WSLDPopupEncryptionKeyLength").value = encryptionKeyLength + " bits" + " (" + encryptionAlgorithm + " Encryption Algorithm)";
    	  document.getElementById("WSLDPopupEncryptionKeyLengthScore").value = "16/20";
      }else if(0 < encryptionKeyLength < 128){
    	  wsldfirefoxResult += 4;
    	  document.getElementById("WSLDPopupEncryptionKeyLength").value = encryptionKeyLength + " bits" + " (" + encryptionAlgorithm + " Encryption Algorithm)";
    	  document.getElementById("WSLDPopupEncryptionKeyLengthScore").value = "4/20";
      }else {
    	  wsldfirefoxResult += 0;
    	  document.getElementById("WSLDPopupEncryptionKeyLength").value = encryptionKeyLength + " bits" + " (" + encryptionAlgorithm + " Encryption Algorithm)";
    	  document.getElementById("WSLDPopupEncryptionKeyLengthScore").value = "0/20";
      }
      
        
      
      if(keyExchangeAlgorithm.contains("ECDHE") || keyExchangeAlgorithm.contains("DHE")){
    	  wsldfirefoxResult += 7.5;
    	  document.getElementById("WSLDPopupKeyExchangePFS").value = "Perfect Forward Secracy(PFS) IMPLEMENTED (" + keyExchangeAlgorithm + " Key Exchange Algorithm)";
    	  document.getElementById("WSLDPopupKeyExchangePFSScore").value = "7.5/7.5";
      }else{
    	  document.getElementById("WSLDPopupKeyExchangePFS").value = "Perfect Forward Secracy(PFS) NOT IMPLEMENTED ! (" + keyExchangeAlgorithm + " Key Exchange Algorithm)";
    	  document.getElementById("WSLDPopupKeyExchangePFSScore").value = "0/7.5";
      }
      
      
     
      
      
      
          
          delete cipherArray;
          
       }

     

      
        
     // Set weakSignatureAlgorithm Bolean value to check the use of MD5 or MD2
	      if (!(MACAlgorithm.contains("MD5") || MACAlgorithm.contains("MD2"))){

	    	//Set progress bar and strength indicating text
		      objwsldfirefox.setSecurityLevel (wsldfirefoxResult);
	      }else {
	    	  objwsldfirefox.setProgress(0);
	 	      document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/nosecurity.gif";
	    	  document.getElementById("WSLDPopupGeneralTotalScore").value = "0 % (Uses " + MACAlgorithm + ", Insecure Certificate Signature (Hash) Algorithm)";
	    	  document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The website claims it implements SSL security functionality but VERY WEAK signature algorithm is used to";
	          document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "confirm the trustworthiness of the information ! NOT RECOMENDED TO INSERT SENSITIVE INFORMATION ON THIS PAGE !!! ";
	      }
     
	    
     
     }
     
     // http connections
     else {
    	 wsldfirefoxResult = 0;
       document.getElementById("securityicon").src="chrome://wsldfirefox/skin/globe.png";
       document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/nosecurity.gif";
       
       document.getElementById("WSLDPopupKeyExchangePrivateKey").value = "0 bits (No Private Key for Authentication and/or Key Exchange !)";
       document.getElementById("WSLDPopupKeyExchangePrivateKeyScore").value = "0/7.5";
	   document.getElementById("WSLDPopupKeyExchangePFS").value = "Perfect Forward Secracy(PFS) NOT IMPLEMENTED (NO Key Exchange Performed) !";
 	   document.getElementById("WSLDPopupKeyExchangePFSScore").value = "0/7.5";
 	   document.getElementById("WSLDPopupEncryptionKeyLength").value = "0 bits (Page NOT Encrypted !)";
 	   document.getElementById("WSLDPopupEncryptionKeyLengthScore").value = "0/20";
 	  
       document.getElementById("WSLDPopupCertificateAvailability").value = "The connection to this website is NOT SECURED by use of SSL certificate.";
 	   document.getElementById("WSLDPopupCertificateAvailabilityScore").value = "0/50";       
 	   
 	   document.getElementById("WSLDPopupCertificateValidation").value = "The website uses HTTP connection and its identity is not verified	! But other pages";
       document.getElementById("WSLDPopupCertificateValidation2").value = "in this domain may be secured by SSL.";
       document.getElementById("WSLDPopupCertificateValidationScore").value = "0/10";
       objwsldfirefox.setSecurityLevel (wsldfirefoxResult);
      }
     
     

   },
   
	// Set the progress bar, total score and its meaning
   setSecurityLevel: function(securityLevel){
       if (securityLevel >= 90.25 ) {
    	   // change style of progressmeter and set the progress result
         objwsldfirefox.setProgress(securityLevel);
         document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/verystrong.gif";

         document.getElementById("WSLDPopupGeneralTotalScore").value = securityLevel + " %";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website uses VERY STRONG Security implementation. All page content is encrypted.";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "It is Highly Unlikely for your data to be seen and/or modified on transit to this website.";
       } else if (securityLevel >= 72 && securityLevel < 90.25) {
         objwsldfirefox.setProgress(securityLevel);
         document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/strong.gif";

         document.getElementById("WSLDPopupGeneralTotalScore").value = securityLevel + " %";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website uses STRONG Security implementation. All page content is encrypted.";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "It is Unlikely for your data to be seen and/or modified on transit to this website.";
       } else if (securityLevel >= 55.5 && securityLevel < 72) {
           objwsldfirefox.setProgress(securityLevel);
           document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/fair.gif";

           document.getElementById("WSLDPopupGeneralTotalScore").value = securityLevel + " %";
           document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website uses FAIR Security implementation. All page content is encrypted.";
           document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "It is Difficult but Possible for your data to be seen and/or modified on transit to this website.";
         }else if (securityLevel >= 15.5 && securityLevel < 55.5) {
         objwsldfirefox.setProgress(securityLevel);
	     document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/weak.gif";

         document.getElementById("WSLDPopupGeneralTotalScore").value = securityLevel + " %  (penalized 40% score for detection of Mixed Content !)";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website uses WEAK Security implementation. The page is only partially encrypted. So, the non-encrypted";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "contents of the page might be seen on transit ! NOT RECOMENDED TO INSERT SENSITIVE INFORMATION ON THIS PAGE !!! ";
       } else if (securityLevel > 0 && securityLevel < 15.5) {
           objwsldfirefox.setProgress(securityLevel);
  	     document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/veryweak.gif";

           document.getElementById("WSLDPopupGeneralTotalScore").value = securityLevel + " %  (penalized 40% score for detection of Mixed Content !)";
           document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website uses VERY WEAK Security implementation. The page is only PARTIALLY and Very WEAKLY encrypted. So, the non-encrypted";
           document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "(and even the weakly encrypted) contents of the page might be seen on transit ! NOT RECOMENDED TO INSERT SENSITIVE INFORMATION ON THIS PAGE !!! ";
         }else if (securityLevel = 0) {
         objwsldfirefox.setProgress(securityLevel);
	     document.getElementById("strengthimage").src="chrome://wsldfirefox/skin/nosecurity.gif";

         document.getElementById("WSLDPopupGeneralTotalScore").value = securityLevel + " %";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning").value = "The connection to this website DO NOT use any security implementation. All the page content is NOT encrypted. Therefore, ";
         document.getElementById("WSLDPopupGeneralTotalScoreMeaning2").value = "all contents might be seen on transit ! NOT RECOMENDED TO INSERT SENSITIVE INFORMATION ON THIS PAGE !!!";
       }
       
       
       
   },
   
   setProgress: function(progressResult) {
	   var progressBar = document.getElementById("WSLDFirefoxProgressmeter");
		var progressValue = progressResult;
		var percentageDescription = document.getElementById("WSLDFirefoxDescription");
		var x = progressValue;
		
		if(parseInt(x) > 100){
			x = 100;
		} 
		
		progressBar.value = x;
		
		percentageDescription.value = x + "%";
	},
	
	
	// Verify Notification for Trustmarks if found
	ViewNotifyPanelTrustmark: function(idanchor) {
		var notifyPopup1 = document.getElementById("clickNotifyPopupTrustmark"); 
		var notifyPopupAnchor1 = document.getElementById(idanchor);
		notifyPopup1.openPopup(notifyPopupAnchor1, 'after_end');

	},
	
	veiwSecurityDetails: function() {
		   var popupWindow = document.getElementById("WSLDPopup"); 
		   var popupAnchor = document.getElementById("WSLDFirefoxViewDetailButton");
		   popupWindow.openPopup(popupAnchor, 'after_end');
	},
	
	// Open About the Extension link
	openAbout: function() {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab('https://sites.google.com/site/haidevelopments/');
	},
	
	// Open Help link
	openHelp: function() {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab('https://sites.google.com/site/haidevelopments/home/help');
	},
	
	// Open Norton SECURED link
	openNortonSECURED: function() {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab('https://www.symantec.com/page.jsp?id=ssl-resources');
	},
	
	// Open McAfee SECURE link
	openMcAfeeSECURE: function() {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab('http://www.mcafee.com/us/mcafeesecure/');
	},
	
	// Open TRUSTe link
	openTRUSTe: function() {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab('http://www.truste.com/resources/privacy-best-practices');
	},
	
	openHowToVerify: function() {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab('http://consumer-law.lawyers.com/identity-theft/check-for-trust-marks-on-internet-sites-before-you-buy.html');
	},
	
	// view the page info with the security tab first
	PageInfoDialog: function() {
		var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);	
		if( versionChecker.compare( appInfo.version, "3.0b3" ) >= 0 ) {
			// Firefox 3.0 beta3 or later
			//window.openDialog('chrome://browser/content/pageinfo/pageInfo.xul')
			var extraArgument = {doc: null, initialTab: "securityTab"};
			var inType = "Browser:page-info";
			var windowUri = "chrome://browser/content/pageinfo/pageInfo.xul";
			var features = "chrome,dialog=no";
			window.openDialog(windowUri, "_blank", features, extraArgument);
			//window.openDialog("chrome://browser/content/pageinfo/pageInfo.xul", "_blank", "dialog=no", null, "securityTab");
		} else {
			// a previous Firefox version
			//window.openDialog('chrome://browser/content/pageInfo.xul')
			var extraArgument = {doc: null, initialTab: "securityTab"};
			var inType = "Browser:page-info";
			var windowUri = "chrome://browser/content/pageInfo.xul";
			var features = "chrome,dialog=no";
			window.openDialog(windowUri, "_blank", features, extraArgument);			
			//window.openDialog("chrome://browser/content/pageInfo.xul", "_blank", "dialog=no", null, "securityTab");
		};
	},
	
	

};
