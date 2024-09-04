import React, { useState, useEffect } from "react";

const WORKER_URL = "https://github-oauth-worker.sahir.workers.dev";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(["accessToken"], (result) => {
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }
    });
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "tokenReceived") {
        setAccessToken(request.token);
      }
    });
  }, []);

  const handleLogin = () => {
    chrome.runtime.sendMessage({ type: "login" });
  };

  const fetchRepos = async () => {
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
  };

  const fetchFiles = async (repo) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setFiles(data);
      setSelectedRepo(repo);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const downloadFile = async (file) => {
    try {
      const response = await fetch(
        `${WORKER_URL}/download?url=${encodeURIComponent(file.download_url)}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const downloadAndUploadFile = async (file) => {
    try {
      const response = await fetch(file.download_url, {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // Send message to content script to upload the file
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          console.log("Sending message to content script");
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "upload_file",
              fileName: file.name,
              fileType: response.headers.get("content-type"),
              fileData: arrayBuffer,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message:",
                  chrome.runtime.lastError
                );
              } else {
                console.log("Message sent successfully", response);
              }
            }
          );
        } else {
          console.error("No active tab found");
        }
      });
    } catch (error) {
      console.error("Error downloading and uploading file:", error);
    }
  };

  return (
    <div>
      {!accessToken ? (
        <button onClick={handleLogin}>Login with GitHub</button>
      ) : (
        <div>
          <h2>Your Repositories</h2>
          <button onClick={fetchRepos}>Fetch Repositories</button>
          <ul>
            {repos.map((repo) => (
              <li key={repo.id}>
                {repo.name}
                <button onClick={() => fetchFiles(repo)}>Select</button>
              </li>
            ))}
          </ul>
          {selectedRepo && (
            <div>
              <h3>Files in {selectedRepo.name}</h3>
              <ul>
                {files.map((file) => (
                  <li key={file.sha}>
                    {file.name}
                    <button onClick={() => downloadFile(file)}>Download</button>
                    <button onClick={() => downloadAndUploadFile(file)}>
                      Download & Upload
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
