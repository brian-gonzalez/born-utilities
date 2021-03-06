/**
 * [Utilities]: methods and objects that contain reusable functionality and can be called on demand.
 */

/**
 * A few polyfillis to add core functionality on old browsers and help get rid of jQuery.
 * These should be removed once we don't care about older browsers.
 */
(function() {
    //Element.matches()
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector;
    }

    //Element.closest()
    if (!Element.prototype.closest) {
        Element.prototype.closest = _getClosest;
    }
})();

function _getClosest(selector) {

    let currentEl = this;

    while (currentEl.constructor !== HTMLHtmlElement) {
        if (currentEl.parentNode.matches(selector)) {

            return currentEl.parentNode;

        } else if (currentEl.matches(selector)) {

            return currentEl;

        }

        currentEl = currentEl.parentNode;
    }

    return false;
}

/**
 * Returns true if current browser "is mobile" 
 * @return {Boolean}
 */
export const isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

/**
 * Returns true if the document element <html> has its dir attribute set to rtl (dir="rtl")
 * @return {Boolean}
 */
export function isRTL () {
    return document.documentElement.getAttribute('dir') === 'rtl' ? true : false;
};

/**
 * [Returns the transition event type supported by the browser]
 */
export function whichTransition () {
    var dummyEl = document.createElement('dummy'),
        transitions = {
            'transition':       'transitionend',
            'OTransition':      'oTransitionEnd',
            'MozTransition':    'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

    for(var key in transitions){
        if( dummyEl.style[key] !== undefined ){
            return transitions[key];
        }
    }
}

/**
 * [createElWithAttrs creates an element with a set of given attributes passed as the 2nd parameter,
 * then appends the new element to the target parent passed on the 1st parameter]
 * @param  {[String]} appendTarget [description]
 * @param  {[Object]} attributes   [description]
 * @param  {[String]} type        [description]
 * @return {[Element]}              [description]
 */
export function createElWithAttrs (appendTarget, attributes, type, textContent) {
    let el;

    if (typeof type === 'object') {
        let fullNameSpace = type.nameSpace === 'svg' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml';

        el = document.createElementNS(fullNameSpace, type.tagName || 'div');
    } else {
        el = document.createElement(type || 'div');
    }

    for(var key in attributes) {
        el.setAttribute(key, attributes[key]);
    }

    if (textContent) {
        el.textContent = '';

        el.insertAdjacentHTML('afterbegin', textContent);
    }

    if (appendTarget) {
        appendTarget.appendChild(el);
    }

    return el;
}

/**
 * Runs a callback on the `elementSelector`.
 * @param  {[type]}   elementSelector [Query String, HTMLElement, or nodeList]
 * @param  {Function} callback        [callback to run with the matches elements.]
 */
export function callbackOnElements (elementSelector, callback) {
    let elementList;

    if (elementSelector.length) {
        if (typeof elementSelector === 'string') {
            elementList = document.querySelectorAll(elementSelector);
        }

        else {
            elementList = elementSelector;
        }

        [].forEach.call(elementList, callback.bind(this));
    }

    else {
        callback.call(this, elementSelector);
    }
}

/**
 * Returns the matched parameter or null.
 * @param  {[String]} name [Name of the parameter to lookup on the current URL]
 */
export function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * Returns true if 'name' parameter or hash is found on the URL.
 */
export function hasURLParameter(name) {
    let regex = new RegExp('[?&]' + name);

    return ('#' + name) === window.location.hash || regex.test(window.location.search);
}

/**
 * Adds the specified getBoundingClientRect()[`property`] from each node found in `elements`.
 * @return {Integer}          [description]
 */
export function getTotalRect (elements, property) {
    let totalOffsetHeight = 0;

    callbackOnElements(elements, function(currentEl) {
        totalOffsetHeight += currentEl.getBoundingClientRect()[property || 'height'];
    });

    return totalOffsetHeight;
}

/**
 * Returns the target relative to the current window scroll position.
 * @param  {HTMLElement | HTML Selector | Number} target [Target element(s) or position value to scroll to]
 * @param  {HTMLElement | NodeList | HTML Selector | Number} offset [Offset element to calculate the height from, or offset value to substract]
 */
export function scrollToPosition (target, offset = 0, scrollContainer) {
    let documentHeight = scrollContainer ? scrollContainer.scrollHeight : Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight),
        documentScrollTop = scrollContainer ? scrollContainer.scrollTop : (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop),
        windowHeight = scrollContainer ? scrollContainer.offsetHeight : document.documentElement.clientHeight,
        totalOffset = typeof offset === 'number' ? offset : getTotalRect(offset),
        targetOffset = typeof target === 'number' ? target : getTotalRect(target, 'top') + documentScrollTop,
        targetOffsetToScroll = Math.round(documentHeight - targetOffset < windowHeight ? documentHeight - windowHeight : targetOffset);

    //Remove manual offset from target position.
    targetOffsetToScroll -= totalOffset;

    return targetOffsetToScroll;
}

//Polyfill for the Object.assign method, which is not supported in IE11.
// inspired by https://github.com/Raynos/xtend/blob/master/mutable.js
export function objectAssign(target) {
    for (let i = 1; i < arguments.length; i++) {
        let source = arguments[i];

        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
}

/**
 * [createCookie creates a cookie]
 * @param  {[string]} name  [cookie name]
 * @param  {[string]} value [cookie description]
 * @param  {[int]} days  [amount of days the cookie must be alive for]
 */
export function createCookie (name, value, days, domain) {
    let expires;

    domain = domain ? (';domain=' + domain) : '';

    if (days) {
        let date = new Date();

        date.setTime(date.getTime() + ( days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toGMTString();
    } else {
        expires = '';
    }

    document.cookie = name + '=' + value + expires + domain + '; path=/';
}

/**
 * [readCookie tries to find a cookie with the provided name]
 * @param  {[string]} name [cookie name]
 * @return {[string]}      [string containing the searched cookie, if any]
 */
export function readCookie (name) {
    var nameEQ = name + '=',
        cookieList = document.cookie.split(';');

    for(var i = 0; i < cookieList.length; i++) {
        let currentCookie = cookieList[i];

        while(currentCookie.charAt(0) == ' ') {
            currentCookie = currentCookie.substring(1,currentCookie.length);
        }

        if (currentCookie.indexOf(nameEQ) === 0) {
            return currentCookie.substring(nameEQ.length, currentCookie.length);
        } 
    }

    return null;
}

/**
 * [eraseCookie]
 * @param  {[string]} name [cookie name that needs to be erased]
 */
export function eraseCookie (name) {
    createCookie(name, '', -1);
}

let focusInterval;

/**
 * Attemps to add focus to a `focusTarget` until it is able to.
 */
export function forceFocus(focusTarget) {
    focusTarget.focus();

    window.clearInterval(focusInterval);

    focusInterval = window.setInterval(function() {
        if (focusTarget.matches(':focus')) {
            window.clearInterval(focusInterval);
        } else {
            focusTarget.focus();
        }
    }, 25);
}

/**
 * Traps keyboard focus in a designated `containerEl`.
 */
export function focusTrap(containerEl) {
    let focusableEls = {};

    if (!containerEl.dataset.focustrapEnabled) {
        containerEl.dataset.focustrapEnabled = true;
        containerEl.addEventListener('focusin', _focusinHandler);
        containerEl.addEventListener('keydown', _tabbingHandler);
    }

    /**
     * Updates the "focusable" element values whenever a child of `containerEl` recives focus.
     */
    function _focusinHandler(evt) {
        //Refresh the focusable elements list whenever something gains focus.
        //This ensures the list is up to date in case the contents of the `containerEl` change.
        focusableEls.list = this.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');

        focusableEls.first = focusableEls.list[0];
        focusableEls.last = focusableEls.list[focusableEls.list.length - 1];

        focusableEls.loopTo = null;

        //Set the `focusableEls.loopTo` value depending on the currently focused element.
        //`focusableEls.loopTo` will be equal to the `focusableEls.first` whenever the `focusableEls.last` receives focus, and viceversa.
        if (evt.target === focusableEls.last) {
            focusableEls.loopTo = focusableEls.first;
        } else if (evt.target === focusableEls.first) {
            focusableEls.loopTo = focusableEls.last;
        }
    }

    /**
     * Listens to the keyboard Tab press and shifts focus to the first/last focusable element.
     */
    function _tabbingHandler(evt) {
        let loopToFirstEl = focusableEls.loopTo === focusableEls.first && !evt.shiftKey,
            loopToLastEl = focusableEls.loopTo === focusableEls.last && evt.shiftKey;

        if (evt.keyCode === 9 && focusableEls.loopTo && (loopToFirstEl || loopToLastEl)) {
            evt.preventDefault();
            focusableEls.loopTo.focus();
        }
    }
}

/**
 * Parses and executes any scripts found within the provided `containerEl` element.
 * @param  {HTMLElement} containerEl [description]
 */
export function parseScripts(containerEl) {
    [].forEach.call(containerEl.querySelectorAll('script'), function(oldScript) {
        const newScript = document.createElement('script');

        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));

        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}
