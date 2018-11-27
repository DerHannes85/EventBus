let defaultSettings = {
    ENABLE_LOG: false,
    ENABLE_LOG_STYLINGS: false,
    ENABLE_LOG_TRACE: false,

    REGISTERED_EVENT_NAMES_ONLY: false
};

let extend = function () {

    let extended = {},
        merge = function (obj) {
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    // Push each value from `obj` into `extended`
                    extended[prop] = obj[prop];
                }
            }
        };

    // Loop through each object and conduct a merge
    for (let i = 0; i < arguments.length; i++) {
        merge(arguments[i]);
    }

    return extended;

};


export default class EventBus {

    constructor(settings = {}, registeredEventNames = {}) {

        this.SETTINGS = extend(defaultSettings, settings);

        this.subscriptions = {};

        this.registeredEventNames = extend({}, registeredEventNames);

    }


    on(evtName, callback, once = false) {
        let evtNameParts;

        if (typeof callback !== 'function') {
            this._log("The callback function is not valid", {"callback": callback});
            return false;
        }

        evtNameParts = this._parseEventName(evtName);

        if (evtNameParts !== false) {

            if (!Array.isArray(this.subscriptions[evtNameParts.key])) {
                this.subscriptions[evtNameParts.key] = [];
            }

            this.subscriptions[evtNameParts.key].push(
                {
                    "name": evtName,
                    "parts": evtNameParts.parts,
                    "callback": callback,
                    "once": once
                }
            );

            this._log("An event was added.", evtName, callback, once);
        }


    }


    once(evtName, callback) {
        this.on(evtName, callback, true);
    }


    off(evtName, callback = false) {

        let evtNameParts = this._parseEventName(evtName, true),
            isWildcard = false,
            evtNameRegexString,
            evtNameRegex,
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
            evtNameRegexString = ''
                + '^'
                + (isWildcard ? '[^.]*' : evtNameParts.parts[0])
                + (evtNameParts.parts.slice(1).length > 0 ? '\\.' : '')
                + evtNameParts.parts.slice(1).join('\\.')
                + '(\\..*$|$)';

        }

        try {
            evtNameRegex = new RegExp(evtNameRegexString);
        } catch (er) {
            this._log("Events regex failed: ", evtNameRegexString);
            return false;
        }

        this._log("Events will be removed with regex: ", evtNameRegexString, evtNameRegex);

        for (let key in this.subscriptions) {

            if (!this.subscriptions.hasOwnProperty(key)) {
                continue;
            }

            if (!isWildcard && key !== evtNameParts.key) {
                continue;
            }

            for (let i = this.subscriptions[key].length - 1; i >= 0; i--) {

                if (evtNameRegex.test(this.subscriptions[key][i].name) && (callback === false || callback === this.subscriptions[key][i].callback)) {
                    this._log("An event was removed.", this.subscriptions[key][i], callback);
                    this.subscriptions[key].splice(i, 1);
                    removed++;
                }

            }

        }

        return removed > 0;
    }


    trigger(evtName, data = {}) {

        let evtNameParts = this._parseEventName(evtName),
            item;

        if (evtNameParts !== false) {

            if (typeof this.subscriptions[evtNameParts.key] !== 'undefined') {

                for (let i = this.subscriptions[evtNameParts.key].length - 1; i >= 0; i--) {

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

    _parseEventName(evtName, wildcards = false) {

        let evtNameParts,
            evtNameIsValid = false,
            evtKey,
            returnValue;

        if (typeof evtName !== 'string' || evtName.length < 1) {
            this._log("The event name is not a string.", {"evtName": evtName});
            return false;
        }

        evtNameParts = evtName.split('.');

        if (evtNameParts[0] !== "") {

            if (this.SETTINGS.REGISTERED_EVENT_NAMES_ONLY) {

                for (let key in this.registeredEventNames) {
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
            this._log("Registered event name is not valid, only use events of this.registeredEventNames.", {"evtName": evtName});
            return false;
        }

        returnValue = {
            key: evtKey,
            parts: evtNameParts
        };

        // this._log("Registered event name is valid.", returnValue);

        return returnValue;
    }

    _log(msg, ...data) {

        if (this.SETTINGS.ENABLE_LOG) {

            if (this.SETTINGS.ENABLE_LOG_STYLINGS) {
                console.log("%cEventBus %c| %c" + msg, "font-weight: bold; color: #2EC4B6;", "font-weight: bold; color: #011627;", "font-weight: bold; color: #96999B;", ...data);
            }
            else {
                console.log("EventBus | " + msg, ...data);
            }
            if (this.SETTINGS.ENABLE_LOG_TRACE === true) {
                console.trace();
            }
        }

    }


}
