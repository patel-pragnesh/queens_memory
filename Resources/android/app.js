var Alloy = require("/alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

var moment = require("alloy/moment");

Alloy.Globals.DigitalForm;

Alloy.Globals.ScanForm;

Alloy.Globals.OralForm;

Alloy.Globals.WildSoundForm;

Alloy.Globals.isIOS7Plus = false;

Alloy.Globals.isAndroid4 = 4 === parseInt(Ti.Platform.version.split(".")[0]);

Alloy.Globals.iPhone6P = "@3x" === Ti.Platform.displayCaps.logicalDensityFactor;

Alloy.Globals.displayWifiSettingsAlert = function(_callback, buttonNames, title, message) {
    Ti.API.debug("in displayWifiSettingsAlert: " + Titanium.Network.online);
    if (Alloy.Globals.wifiAlertDisplayed || Titanium.Network.online) {
        _callback && _callback();
        return;
    }
    Alloy.Globals.wifiAlertDisplayed = true;
    var buttons = [ "WiFi Settings", "Cancel" ];
    var d = Ti.UI.createAlertDialog({
        title: title || "No Network Detected",
        message: message || "You are currently offline. We strongly recommend Wi-Fi or broadband- quality connections for uploading. Do you want to check your Wifi settings?",
        buttonNames: buttonNames ? buttonNames : buttons
    });
    d.addEventListener("click", function(_event) {
        if (0 === _event.index) {
            var intent = Ti.Android.createIntent({
                action: "android.settings.WIFI_SETTINGS"
            });
            Ti.Android.currentActivity.startActivity(intent);
        } else {
            Alloy.Globals.wifiAlertDisplayed = false;
            _callback && _callback();
        }
        Alloy.Globals.wifiAlertDisplayed = false;
    });
    d.show();
};

Alloy.Globals.countDown = function(m, s, fn_tick, fn_end) {
    return {
        total_sec: 60 * m + s,
        timer: this.timer,
        set: function(m, s) {
            this.total_sec = 60 * parseInt(m) + parseInt(s);
            this.time = {
                m: m,
                s: s
            };
            return this;
        },
        start: function() {
            var self = this;
            this.timer = setInterval(function() {
                if (self.total_sec) {
                    self.total_sec--;
                    self.time = {
                        m: parseInt(self.total_sec / 60),
                        s: self.total_sec % 60
                    };
                    fn_tick();
                } else {
                    self.stop();
                    fn_end();
                }
            }, 1e3);
            return this;
        },
        stop: function() {
            clearInterval(this.timer);
            this.time = {
                m: 0,
                s: 0
            };
            this.total_sec = 0;
            return this;
        }
    };
};

Alloy.Globals.rotateAndResize = function(media, width, quality) {
    var utilsModule = require("com.jreyes.imagerotatecorrection");
    var dataDirectory = Ti.Filesystem.getApplicationDataDirectory();
    var fileName = String.format("QPL_Photo_%s.jpg", moment().format("YYYY-MM-DD-HH-mm-ss-SSS-ZZ"));
    var file = Ti.Filesystem.getFile(dataDirectory, fileName);
    var fileNativePath = file.nativePath;
    file.write(media);
    file = null;
    utilsModule.rotateResizeImage(fileNativePath, width || 640, quality || 80);
    media = Ti.Filesystem.getFile(fileNativePath);
    return media;
};

Alloy.Globals.base64Check = function(media) {
    if (Ti.Utils.base64encode(media).toString()) {
        Ti.API.info("Image check passed.");
        return true;
    }
    return false;
};

Ti.App.addEventListener("close", function(e) {
    Ti.App.Properties.setBool("AlertPOST", false);
    !!Ti.App.Properties.getBool("Remember Me");
    if (!checkRN) {
        Ti.App.Properties.setString("First Name", $.fText.value);
        Ti.App.Properties.setString("Last Name", $.lText.value);
        Ti.App.Properties.setString("Email Address", $.emailA.value);
        Ti.App.Properties.setBool("Remember Me", false);
    }
});

Alloy.createController("index");