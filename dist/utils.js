"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debounce(func, wait) {
    let timeoutID;
    if (!Number.isInteger(wait)) {
        console.warn("Called debounce without a valid number");
        wait = 300;
    }
    // conversion through any necessary as it wont satisfy criteria otherwise
    return function (...args) {
        clearTimeout(timeoutID);
        const context = this;
        timeoutID = window.setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}
exports.debounce = debounce;
;
//# sourceMappingURL=utils.js.map