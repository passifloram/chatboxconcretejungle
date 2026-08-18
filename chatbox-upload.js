/* ==================================================
   FORUMACTIF CHATBOX — BOUTON D'UPLOAD D'IMAGE
   Hébergement : ImgBB
   ================================================== */

(function () {
  "use strict";

  var CONFIG = {
    apiKey: String(window.CHATBOX_UPLOAD_IMGBB_KEY || "").trim(),
    maxSizeMb: 16,
    buttonTitle: "Ajouter une image",
    uploadingLabel: "Upload en cours…"
  };

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function showError(message) {
    window.alert("Upload impossible : " + message);
  }

  function insertAtCursor(field, text) {
    var start = typeof field.selectionStart === "number"
      ? field.selectionStart
      : field.value.length;
    var end = typeof field.selectionEnd === "number"
      ? field.selectionEnd
      : field.value.length;
    var before = field.value.slice(0, start);
    var after = field.value.slice(end);
    var prefix = before && !/\s$/.test(before) ? " " : "";
    var suffix = after && !/^\s/.test(after) ? " " : "";
    var insertion = prefix + text + suffix;

    field.value = before + insertion + after;
    field.focus();

    var cursor = before.length + insertion.length;
    if (typeof field.setSelectionRange === "function") {
      field.setSelectionRange(cursor, cursor);
    }

    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function uploadImage(file, button, messageField) {
    if (!CONFIG.apiKey || CONFIG.apiKey === "YOUR_IMGBB_API_KEY") {
      showError("la clé API ImgBB n'est pas configurée.");
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      showError("le fichier sélectionné n'est pas une image.");
      return;
    }

    if (file.size > CONFIG.maxSizeMb * 1024 * 1024) {
      showError("l'image dépasse " + CONFIG.maxSizeMb + " Mo.");
      return;
    }

    var oldLabel = button.innerHTML;
    button.disabled = true;
    button.classList.add("is-uploading");
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
    button.setAttribute("aria-label", CONFIG.uploadingLabel);
    button.title = CONFIG.uploadingLabel;

    try {
      var data = new FormData();
      data.append("image", file);

      var response = await fetch(
        "https://api.imgbb.com/1/upload?key=" + encodeURIComponent(CONFIG.apiKey),
        {
          method: "POST",
          body: data
        }
      );

      var result = await response.json();

      if (!response.ok || !result.success || !result.data || !result.data.url) {
        throw new Error(
          result && result.error && result.error.message
            ? result.error.message
            : "réponse incorrecte de l'hébergeur"
        );
      }

      insertAtCursor(messageField, "[img]" + result.data.url + "[/img]");
    } catch (error) {
      showError(error && error.message ? error.message : "erreur inconnue");
    } finally {
      button.disabled = false;
      button.classList.remove("is-uploading");
      button.innerHTML = oldLabel;
      button.setAttribute("aria-label", CONFIG.buttonTitle);
      button.title = CONFIG.buttonTitle;
    }
  }

  ready(function () {
    if (document.getElementById("cb-image-upload")) return;

    var messageField = document.querySelector(
      "#message, #chatbox_messenger_form textarea[name='message'], " +
      "#chatbox_messenger_form input[name='message']"
    );
    var form = document.getElementById("chatbox_messenger_form");

    if (!messageField || !form) return;

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "cb-image-file";
    fileInput.accept = "image/png,image/jpeg,image/gif,image/webp";
    fileInput.hidden = true;

    var uploadButton = document.createElement("button");
    uploadButton.type = "button";
    uploadButton.id = "cb-image-upload";
    uploadButton.className = "cb-image-upload";
    uploadButton.title = CONFIG.buttonTitle;
    uploadButton.setAttribute("aria-label", CONFIG.buttonTitle);
    uploadButton.innerHTML = '<i class="fa-solid fa-image" aria-hidden="true"></i>';

    uploadButton.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (file) uploadImage(file, uploadButton, messageField);
      fileInput.value = "";
    });

    form.insertBefore(uploadButton, messageField);
    document.body.appendChild(fileInput);
  });
})();
