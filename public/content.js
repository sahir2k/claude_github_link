/* global chrome */
// This script will run on the target webpage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "upload_file") {
    const fileInput = document.querySelector(
      'input[data-testid="project-doc-upload"]'
    );
    if (fileInput) {
      // Create a File object from the data sent from the popup
      const file = new File([request.fileData], request.fileName, {
        type: request.fileType,
      });

      // Create a DataTransfer object and add our file to it
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Set the file input's files
      fileInput.files = dataTransfer.files;

      // Dispatch a change event on the file input
      const event = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  }
});
