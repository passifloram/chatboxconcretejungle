/* ==================================================
   FORUMACTIF CHATBOX — BOUTON BALISE IMAGE
   Insère [img][/img] et place le curseur au milieu.
   ================================================== */

(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function insertImageTags(field) {
    var openingTag = "[img]";
    var closingTag = "[/img]";
    var start = typeof field.selectionStart === "number"
      ? field.selectionStart
      : field.value.length;
    var end = typeof field.selectionEnd === "number"
      ? field.selectionEnd
      : field.value.length;
    var selectedText = field.value.slice(start, end);
    var insertion = openingTag + selectedText + closingTag;

    field.value =
      field.value.slice(0, start) +
      insertion +
      field.value.slice(end);

    field.focus();

    var cursorStart = start + openingTag.length;
    var cursorEnd = cursorStart + selectedText.length;

    if (typeof field.setSelectionRange === "function") {
      field.setSelectionRange(cursorStart, cursorEnd);
    }

    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  ready(function () {
    if (document.getElementById("cb-image-upload")) return;

    var messageField = document.querySelector(
      "#message, #chatbox_messenger_form textarea[name='message'], " +
      "#chatbox_messenger_form input[name='message']"
    );
    var form = document.getElementById("chatbox_messenger_form");

    if (!messageField || !form) return;

    var imageButton = document.createElement("button");
    imageButton.type = "button";
    imageButton.id = "cb-image-upload";
    imageButton.className = "cb-image-upload";
    imageButton.title = "Insérer une image";
    imageButton.setAttribute("aria-label", "Insérer une image");
    imageButton.innerHTML =
      '<i class="fa-solid fa-image" aria-hidden="true"></i>';

    imageButton.addEventListener("click", function () {
      insertImageTags(messageField);
    });

    /* Le champ #message est parfois imbriqué dans un sous-conteneur
       selon la version Forumactif : insertion dans son parent réel. */
    messageField.parentNode.insertBefore(imageButton, messageField);
  });
})();
