"use strict";

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

window.addEventListener("input", ev => {
    browser.runtime.sendMessage({
        subject: "hide_cursor"
    });

    if (!is_listening) {
        for (const type of event_types) {
            window.addEventListener(type, on_mouse_event);
        }
        is_listening = true;
    }
});
