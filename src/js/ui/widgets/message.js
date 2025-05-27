/**
 * @requires paste/dom
 * @module paste/ui/widget/message
 */

paste.define(
    'paste.ui.widget.message',
    [
        'paste.dom'
    ],
    function (module, dom) {
        'use strict';
        var removeMessageBox = function() {
                var ERROR_BOX_CLASS = "error-box",
                    MESSAGE_BOX_CLASS = "message-box",
                    existingMessage = dom.get('.'+MESSAGE_BOX_CLASS, true);

                if (existingMessage.length === 0) existingMessage = dom.get('.'+ERROR_BOX_CLASS, true);
                if (existingMessage.length > 0) {
                    for (var i=0; i < existingMessage.length; i++){
                        existingMessage[i].parentNode.removeChild(existingMessage[i]);
                    }
                }
            },
            messageBox = function (parentEl, message, messageClass, doScrollTop, fadeOut) {
                var messageBox,
                    messageItem;

                if (typeof parentEl === "string") {
                    parentEl = dom.get(parentEl, true)[0];
                }

                removeMessageBox();

                if (doScrollTop) document.body.scrollTop = document.documentElement.scrollTop = 0;
                messageBox = document.createElement("ul");
                messageItem = document.createElement("li");
                messageBox.className = messageClass;
                messageItem.innerHTML = message;
                messageBox.appendChild(messageItem);
                parentEl.parentNode.insertBefore(messageBox, parentEl.nextSibling);
                if (fadeOut) {
                    setTimeout(function(){ messageBox.classList.add("fade-out")}, 1000);
                    setTimeout(function(){ messageBox.style.display = "none"}, 2000);
                }
            };

        module['messageBox'] = messageBox;
        module['removeMessageBox'] = removeMessageBox;

    }
);
