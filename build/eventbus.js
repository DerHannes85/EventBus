"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultSettings = {
    ENABLE_LOG: false,
    ENABLE_LOG_STYLINGS: false,
    ENABLE_LOG_TRACE: false,

    REGISTERED_EVENT_NAMES_ONLY: false
};

var extend = function extend() {

    var extended = {},
        merge = function merge(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // Push each value from `obj` into `extended`
                extended[prop] = obj[prop];
            }
        }
    };

    // Loop through each object and conduct a merge
    for (var i = 0; i < arguments.length; i++) {
        merge(arguments[i]);
    }

    return extended;
};

var EventBus = function () {
    function EventBus() {
        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var registeredEventNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, EventBus);

        this.SETTINGS = extend(defaultSettings, settings);

        this.subscriptions = {};

        this.registeredEventNames = extend({}, registeredEventNames);
    }

    _createClass(EventBus, [{
        key: "on",
        value: function on(evtName, callback) {
            var once = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var evtNameParts = void 0;

            if (typeof callback !== 'function') {
                this._log("The callback function is not valid", { "callback": callback });
                return false;
            }

            evtNameParts = this._parseEventName(evtName);

            if (evtNameParts !== false) {

                if (!Array.isArray(this.subscriptions[evtNameParts.key])) {
                    this.subscriptions[evtNameParts.key] = [];
                }

                this.subscriptions[evtNameParts.key].push({
                    "name": evtName,
                    "parts": evtNameParts.parts,
                    "callback": callback,
                    "once": once
                });

                this._log("An event was added.", evtName, callback, once);
            }
        }
    }, {
        key: "once",
        value: function once(evtName, callback) {
            this.on(evtName, callback, true);
        }
    }, {
        key: "off",
        value: function off(evtName) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


            var evtNameParts = this._parseEventName(evtName, true),
                isWildcard = false,
                evtNameRegexString = void 0,
                evtNameRegex = void 0,
                removed = 0;

            if (evtNameParts === false) {

                isWildcard = true;
                evtNameRegexString = '^.*$';
            } else {

                if (evtNameParts.key === false) {
                    isWildcard = true;
                }

                // Examples:
                // ^myevent(\..*$|$)
                // ^myevent\.ns1\.ns2\.ns3(\..*$|$)
                // ^[^.]*\.ns1\.ns2\.ns3(\..*$|$)
                evtNameRegexString = '' + '^' + (isWildcard ? '[^.]*' : evtNameParts.parts[0]) + (evtNameParts.parts.slice(1).length > 0 ? '\\.' : '') + evtNameParts.parts.slice(1).join('\\.') + '(\\..*$|$)';
            }

            try {
                evtNameRegex = new RegExp(evtNameRegexString);
            } catch (er) {
                this._log("Events regex failed: ", evtNameRegexString);
                return false;
            }

            this._log("Events will be removed with regex: ", evtNameRegexString, evtNameRegex);

            for (var key in this.subscriptions) {

                if (!this.subscriptions.hasOwnProperty(key)) {
                    continue;
                }

                if (!isWildcard && key !== evtNameParts.key) {
                    continue;
                }

                for (var i = this.subscriptions[key].length - 1; i >= 0; i--) {

                    if (evtNameRegex.test(this.subscriptions[key][i].name) && (callback === false || callback === this.subscriptions[key][i].callback)) {
                        this._log("An event was removed.", this.subscriptions[key][i], callback);
                        this.subscriptions[key].splice(i, 1);
                        removed++;
                    }
                }
            }

            return removed > 0;
        }
    }, {
        key: "trigger",
        value: function trigger(evtName) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


            var evtNameParts = this._parseEventName(evtName),
                item = void 0;

            if (evtNameParts !== false) {

                if (typeof this.subscriptions[evtNameParts.key] !== 'undefined') {

                    for (var i = this.subscriptions[evtNameParts.key].length - 1; i >= 0; i--) {

                        // store the callback
                        item = this.subscriptions[evtNameParts.key][i];

                        // Handle once subscriptions
                        if (item.once === true) {
                            this._log("An event was triggered and subscription was deleted because of once.");
                            this.subscriptions[evtNameParts.key].splice(i, 1);
                        }

                        // call the callback
                        this._log("An event was triggered and a callback was found.", evtNameParts.key, item);
                        item.callback(evtNameParts.parts[0], data);
                    }
                }
            }
        }
    }, {
        key: "_parseEventName",
        value: function _parseEventName(evtName) {
            var wildcards = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


            var evtNameParts = void 0,
                evtNameIsValid = false,
                evtKey = void 0,
                returnValue = void 0;

            if (typeof evtName !== 'string' || evtName.length < 1) {
                this._log("The event name is not a string.", { "evtName": evtName });
                return false;
            }

            evtNameParts = evtName.split('.');

            if (evtNameParts[0] !== "") {

                if (this.SETTINGS.REGISTERED_EVENT_NAMES_ONLY) {

                    for (var key in this.registeredEventNames) {
                        if (!this.registeredEventNames.hasOwnProperty(key)) {
                            continue;
                        }

                        if (this.registeredEventNames[key] === evtNameParts[0]) {
                            evtNameIsValid = true;
                            evtKey = this.registeredEventNames[key];
                            break;
                        }
                    }
                } else {
                    evtNameIsValid = true;
                    evtKey = evtNameParts[0];
                }
            } else if (wildcards && evtNameParts.length > 1) {

                evtNameIsValid = true;
                evtKey = false;
            }

            if (!evtNameIsValid) {
                this._log("Registered event name is not valid, only use events of this.registeredEventNames.", { "evtName": evtName });
                return false;
            }

            returnValue = {
                key: evtKey,
                parts: evtNameParts
            };

            // this._log("Registered event name is valid.", returnValue);

            return returnValue;
        }
    }, {
        key: "_log",
        value: function _log(msg) {

            if (this.SETTINGS.ENABLE_LOG) {
                for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    data[_key - 1] = arguments[_key];
                }

                if (this.SETTINGS.ENABLE_LOG_STYLINGS) {
                    var _console;

                    (_console = console).log.apply(_console, ["%cEventBus %c| %c" + msg, "font-weight: bold; color: #2EC4B6;", "font-weight: bold; color: #011627;", "font-weight: bold; color: #96999B;"].concat(data));
                } else {
                    var _console2;

                    (_console2 = console).log.apply(_console2, ["EventBus | " + msg].concat(data));
                }
                if (this.SETTINGS.ENABLE_LOG_TRACE === true) {
                    console.trace();
                }
            }
        }
    }]);

    return EventBus;
}();

exports.default = EventBus;
