/* global chrome */
// This script will run on the target webpage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "upload_file") {
    const fileInput = document.querySelector(
      'input[data-testid="project-doc-upload"]'
    );
    if (fileInput) {
      // Decode base64 data
      const binaryString = atob(request.fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create a Blob from the Uint8Array
      const blob = new Blob([bytes], { type: request.fileType });

      // Create a File object from the blob
      const file = new File([blob], request.fileName, {
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

      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "File input not found" });
    }
  }
  return true; // Indicates that the response will be sent asynchronously
});
