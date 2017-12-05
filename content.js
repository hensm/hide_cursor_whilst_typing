"use strict";

/**
 * The last keypress in a focused element is recorded and
 * checked against the target of an input event to verify a
 * genuine keyboard action.
 */
let pending_input = null;

window.addEventListener("keypress", ev => {
    const focused_el = document.querySelector(":focus");
    pending_input = focused_el || null;
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
    if (pending_input && ev.target === pending_input) {
        pending_input = null;

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

// Show cursor on tab change
window.addEventListener("blur", ev => {
    browser.runtime.sendMessage({
        subject: "show_cursor"
    });
});
