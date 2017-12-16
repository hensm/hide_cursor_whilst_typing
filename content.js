"use strict";

/**
 * The last keypress in a focused element is recorded and
 * checked against the target of an input event to verify a
 * genuine keyboard action.
 */
let pending_input = null;

/**
 * If an event handler within the page calls stopPropagation,
 * the event doesn't bubble to the global event handler, so
 * individual event handlers are set on the inputs.
 */
let has_event_set = false;

window.addEventListener("keypress", ev => {
    const focused_el = document.querySelector(":focus");
    pending_input = focused_el || null;

    if (pending_input) {
        pending_input.addEventListener("input", on_input);
        has_event_set = true;
    }
});


/**
 * If an event handler within the page calls
 * stopImmediatePropagation, the event never reaches the
 * extension's event handlers. So, all calls to
 * stopImmediatePropagation are intercepted and the event is
 * forwarded if appropriate.
 */
const intercept_target = Event.prototype.stopImmediatePropagation;
const intercept = function () {
    // Call original function
    intercept_target.apply(this, arguments);

    // Only catch input events
    if (this.type !== "input") return;

    // If keypress registered and event set for this target
    if (this.target === pending_input && has_event_set) {
        on_input(this);
    }
};

// Page has a different context
exportFunction(intercept, Event.prototype, {
    defineAs: "stopImmediatePropagation"
});


// Whether listeners have been set
let is_listening = false;

// User <-> mouse interaction events
const event_types = [
    "mousemove"
  , "mousedown"
  , "wheel"
];

function on_mouse_event (ev) {
    for (const type of event_types) {
        window.removeEventListener(type, on_mouse_event);
    }

    is_listening = false;

    browser.runtime.sendMessage({
        subject: "show_cursor"
    });
}

/**
 * Checks input/clipboard events against a recorded keypress
 * before hiding the cursor.
 */
function on_input (ev) {
    const from_pending_input = pending_input && ev.target === pending_input;
    const from_design_mode = ev.target === document.body
            && document.designMode === "on";

    if (has_event_set) {
        pending_input.removeEventListener("input", on_input);
        has_event_set = false;
    }

    if (from_pending_input) {
        pending_input = null;
    }

    if (from_pending_input || from_design_mode) {
        browser.runtime.sendMessage({
            subject: "hide_cursor"
        });

        if (!is_listening) {
            // Add event listeners to unhide cursor
            for (const type of event_types) {
                window.addEventListener(type, on_mouse_event);
            }
            is_listening = true;
        }
    }
}

window.addEventListener("input", on_input);
window.addEventListener("paste", on_input);
window.addEventListener("cut", on_input);

// Show cursor when input focus changes
window.addEventListener("focusout", ev => {
    browser.runtime.sendMessage({
        subject: "show_cursor"
    });
});

// Show cursor on tab change
window.addEventListener("blur", ev => {
    browser.runtime.sendMessage({
        subject: "show_cursor"
    });
});
