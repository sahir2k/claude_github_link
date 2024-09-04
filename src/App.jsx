import React, { useState, useEffect } from "react";
import "./App.css";
import githubIcon from "./assets/icons8-github-120.png";

const Icon = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`icon ${className}`}
  >
    {children}
  </svg>
);

const FolderIcon = ({ isOpen }) => (
  <Icon className="folder-icon">
    {isOpen ? (
      <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
    ) : (
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
    )}
  </Icon>
);

const FileIcon = () => (
  <Icon className="file-icon">
    <path
      fillRule="evenodd"
      d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V7.875L14.25 1.5H5.625zM7 7.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 017 9.375v-1.5z"
      clipRule="evenodd"
    />
  </Icon>
);

const DownloadIcon = () => (
  <Icon className="download-icon">
    <path
      fillRule="evenodd"
      d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </Icon>
);

const TreeItem = ({ item, level, isLast, onToggle, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle(item);
  };

  return (
    <div className={`tree-item-container ${isLast ? "last" : ""}`}>
      <div className="tree-item">
        <div className="tree-lines">
          <div className="tree-line-vertical"></div>
          <div className="tree-line-horizontal"></div>
        </div>
        <div className="tree-content" onClick={handleToggle}>
          {item.type === "dir" ? <FolderIcon isOpen={isOpen} /> : <FileIcon />}
          <span className="item-name">{item.name}</span>
        </div>
        {item.type === "file" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(item);
            }}
            className="download-btn"
          >
            <DownloadIcon />
          </button>
        )}
      </div>
      {isOpen && item.children && (
        <div className="tree-children">
          {item.children.map((child, index) => (
            <TreeItem
              key={child.path}
              item={child}
              level={level + 1}
              isLast={index === item.children.length - 1}
              onToggle={onToggle}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ items, onToggle, onDownload }) => (
  <div className="file-tree">
    {items.map((item, index) => (
      <TreeItem
        key={item.path}
        item={item}
        level={0}
        isLast={index === items.length - 1}
        onToggle={onToggle}
        onDownload={onDownload}
      />
    ))}
  </div>
);
const App = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [repos, setRepos] = useState([]);
  const [fileStructure, setFileStructure] = useState({});
  const [error, setError] = useState(null);
  const [openRepos, setOpenRepos] = useState({});

  const toggleRepo = (repoId) => {
    setOpenRepos((prev) => ({
      ...prev,
      [repoId]: !prev[repoId],
    }));
  };

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
    setError(null);
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error("Error fetching repos:", error);
      setError("Failed to fetch repositories. Please try again.");
    }
  };

  const fetchFiles = async (repoFullName, path = "") => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents${path}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      setFileStructure((prev) => ({
        ...prev,
        [repoFullName]: {
          ...prev[repoFullName],
          [path]: data.map((item) => ({
            ...item,
            children: item.type === "dir" ? [] : undefined,
          })),
        },
      }));
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files. Please try again.");
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
      const base64data = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "upload_file",
              fileName: file.name,
              fileType: blob.type,
              fileData: base64data,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message:",
                  chrome.runtime.lastError
                );
              } else {
                console.log("File uploaded successfully", response);
              }
            }
          );
        } else {
          console.error("No active tab found");
        }
      });
    } catch (error) {
      console.error("Error downloading and uploading file:", error);
      setError("Failed to download and upload file. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Claude Github Link</h1>
      {error && <p className="error-message">{error}</p>}
      {!accessToken ? (
        <button onClick={handleLogin} className="action-btn login-btn">
          <img src={githubIcon} alt="GitHub Icon" className="github-icon" />
          Login with GitHub
        </button>
      ) : (
        <div className="repo-container">
          <h2 className="repo-title">Your Repositories</h2>
          <button onClick={fetchRepos} className="action-btn fetch-btn">
            <img src={githubIcon} alt="GitHub Icon" className="github-icon" />
            Sync Repositories
          </button>
          <div className="repo-list">
            {repos.map((repo, index) => (
              <div key={repo.id} className="repo-item">
                <div
                  className="repo-header"
                  onClick={() => fetchFiles(repo.full_name)}
                >
                  <FolderIcon isOpen={false} />
                  <span className="repo-name">{repo.name}</span>
                </div>
                {fileStructure[repo.full_name] &&
                  fileStructure[repo.full_name][""] && (
                    <FileTree
                      items={fileStructure[repo.full_name][""]}
                      onToggle={(item) => fetchFiles(repo.full_name, item.path)}
                      onDownload={downloadAndUploadFile}
                    />
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
