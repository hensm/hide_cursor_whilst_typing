"use strict";

const styles = {
    file: "content.css"
  , allFrames: true
};

browser.runtime.onMessage.addListener((msg, sender) => {
    switch (msg.subject) {
        case "hide_cursor":
            browser.tabs.insertCSS(sender.tab.id, styles);
            break;
        case "show_cursor":
            browser.tabs.removeCSS(sender.tab.id, styles);
            break;
    }
});
