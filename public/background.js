const CLIENT_ID = "";
const WORKER_URL = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "login") {
    chrome.identity.launchWebAuthFlow(
      {
        url: `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${chrome.identity.getRedirectURL()}&scope=repo`,
        interactive: true,
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("Error during auth", chrome.runtime.lastError);
          return;
        }
        const code = new URL(redirectUrl).searchParams.get("code");
        if (code) {
          exchangeCodeForToken(code);
        }
      }
    );
  }
});

async function exchangeCodeForToken(code) {
  try {
    const response = await fetch(`${WORKER_URL}/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirect_uri: chrome.identity.getRedirectURL(),
      }),
    });
    const data = await response.json();
    chrome.storage.local.set({ accessToken: data.access_token }, () => {
      chrome.runtime.sendMessage({
        type: "tokenReceived",
        token: data.access_token,
      });
    });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
  }
}
