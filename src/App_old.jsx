import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const onclick = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
    });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        alert("Hello, world!");
      },
    });
  };

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => setTime((time) => time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const startStop = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setTime(0);
    setIsRunning(false);
  };

  const formatTime = () => {
    const centiseconds = ("0" + (time % 100)).slice(-2);
    const seconds = ("0" + Math.floor((time / 100) % 60)).slice(-2);
    const minutes = ("0" + Math.floor((time / 6000) % 60)).slice(-2);
    return `${minutes}:${seconds}:${centiseconds}`;
  };

  return (
    <>
      <h1>Stopwatch</h1>
      <div className="stopwatch">
        <div className="display">{formatTime()}</div>
        <button onClick={startStop}>{isRunning ? "Stop" : "Start"}</button>
        <button onClick={reset}>Reset</button>
      </div>
    </>
  );
}

export default App;
