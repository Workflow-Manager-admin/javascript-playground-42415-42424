import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // State for code, output, error, theme and shared link
  const [code, setCode] = useState(
    () =>
      window.location.hash.replace(/^#code=/, "")
        ? decodeURIComponent(window.location.hash.replace(/^#code=/, ""))
        : "// Type JavaScript here and hit Run! 👇\nconsole.log('Hello, world!');"
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showShareLink, setShowShareLink] = useState(false);
  const shareInputRef = useRef();

  // Syntax highlighting function (minimal, not full-featured)
  function highlightJS(code) {
    if (!code) return "";
    // Basic keyword and string/number highlighting
    let keywords =
      /\b(const|let|var|if|else|for|while|function|return|class|try|catch|typeof|this|new|import|from|export|default|extends|super)\b/g;
    let strings = /('[^']*'|"[^"]*"|`[^`]*`)/g;
    let numbers = /\b\d+(\.\d+)?\b/g;
    let comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(comments, `<span class="token comment">$1</span>`)
      .replace(strings, `<span class="token string">$1</span>`)
      .replace(numbers, `<span class="token number">$&</span>`)
      .replace(keywords, `<span class="token keyword">$1</span>`);
  }

  // Runs JavaScript code in a sandboxed IIFE and captures output/errors
  // PUBLIC_INTERFACE
  function runCode() {
    setError("");
    setOutput("");
    let out = [];
    const customConsole = {
      log: (...args) => out.push(args.join(" ")),
      error: (...args) => out.push(args.join(" ")),
      warn: (...args) => out.push(args.join(" ")),
      info: (...args) => out.push(args.join(" ")),
    };
    // eslint-disable-next-line no-new-func
    const runner = new Function("console", `
      "use strict";
      try {
        ${code}
      } catch (err) {
        console.error(err);
        throw err;
      }
    `);
    try {
      runner(customConsole);
      setOutput(out.join("\n"));
    } catch (e) {
      setError(e.message);
    }
  }

  // PUBLIC_INTERFACE
  function clearEditor() {
    setCode("");
    setOutput("");
    setError("");
    setShowShareLink(false);
    window.location.hash = "";
  }

  // PUBLIC_INTERFACE
  function shareSnippet() {
    const shareURL =
      window.location.origin +
      window.location.pathname +
      "#code=" +
      encodeURIComponent(code);
    setShowShareLink(true);
    setTimeout(() => {
      if (shareInputRef.current) {
        shareInputRef.current.value = shareURL;
        shareInputRef.current.select();
      }
    }, 0);
  }

  // Handle loading/sharing code from URL
  useEffect(() => {
    function handleHash() {
      if (window.location.hash.startsWith("#code=")) {
        setCode(decodeURIComponent(window.location.hash.replace(/^#code=/, "")));
      }
    }
    window.addEventListener("hashchange", handleHash, false);
    return () => window.removeEventListener("hashchange", handleHash, false);
  }, []);

  // PUBLIC_INTERFACE
  function handleCodeChange(e) {
    setCode(e.target.value);
    setShowShareLink(false);
  }

  // AUTO-COMPLETION (ctrl+space for demo): add "console." or "function"/"return"
  // Modern editors use libraries, but here is a minimal demo autocompletion:
  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === " ") {
      // Simple autocomplete: insert "console.log()"
      e.preventDefault();
      const textarea = e.target;
      const before = code.slice(0, textarea.selectionStart);
      const after = code.slice(textarea.selectionEnd);
      const toInsert = "console.log()";
      setCode(
        before +
          toInsert +
          after
      );
      // Reposition caret within the parens
      setTimeout(() => {
        textarea.setSelectionRange(
          before.length + "console.log(".length,
          before.length + "console.log(".length
        );
      }, 1);
    }
  }

  // Copy share link
  const handleCopyShare = () => {
    if (shareInputRef.current) {
      shareInputRef.current.select();
      document.execCommand("copy");
    }
  };

  return (
    <div className="App playground-root">
      <header
        className="playground-header"
        style={{
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
        }}
      >
        <h1
          className="playground-title"
          style={{
            color: "#1976d2",
            margin: "0.4em 0 0.4em 20px",
            fontWeight: "bold",
            fontSize: "2rem",
            letterSpacing: "0.01em",
          }}
        >
          JavaScript Playground
        </h1>
        <div className="playground-actions">
          <button className="btn" onClick={runCode} title="Run your code (Ctrl+Enter)">
            ▶️ Run
          </button>
          <button className="btn" style={{ marginLeft: 10 }} onClick={clearEditor}>
            🧹 Clear
          </button>
          <button className="btn" style={{ marginLeft: 10 }} onClick={shareSnippet}>
            🔗 Share
          </button>
        </div>
      </header>
      <main className="playground-main">
        <section className="editor-pane">
          <div className="editor-header">
            <span role="img" aria-label="code">
              📝
            </span>{" "}
            Editor (Ctrl+Space for autocompletion)
          </div>
          <div className="editor-container">
            <textarea
              aria-label="JavaScript code editor"
              className="editor-textarea"
              value={code}
              onChange={handleCodeChange}
              autoFocus
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              rows={16}
              style={{
                fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
                fontSize: "1rem",
                width: "100%",
                height: 320,
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                marginBottom: 0,
                padding: "12px 10px",
                resize: "vertical",
              }}
            />
            <pre
              className="editor-highlight"
              style={{
                display: code.length > 0 ? "block" : "none",
                position: "absolute",
                pointerEvents: "none",
                background: "transparent",
                margin: 0,
                padding: "12px 10px",
                color: "#b72e3a",
                fontSize: "1rem",
                fontFamily: "inherit",
                left: 0,
                top: 0,
                width: "100%",
                height: 320,
                zIndex: 0,
                opacity: 0.16, // Faint backing under text
                borderRadius: "6px",
                overflow: "hidden",
                whiteSpace: "pre",
              }}
              dangerouslySetInnerHTML={{
                __html: highlightJS(code),
              }}
            />
          </div>
        </section>
        <section className="output-pane">
          <div className="output-header">
            <span role="img" aria-label="terminal">
              🖥️
            </span>{" "}
            Output
          </div>
          <div className="output-container">
            {error && (
              <div className="output-error" style={{ color: "#b72e3a", fontWeight: "bold" }}>
                {error}
              </div>
            )}
            {!error && (
              <pre
                className="output"
                style={{
                  color: "#1976d2",
                  background: "#f1f6fb",
                  minHeight: "3em",
                  fontFamily:
                    "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "12px 8px",
                  margin: "0",
                }}
              >
                {output}
              </pre>
            )}
          </div>
          {showShareLink && (
            <div className="share-link-box" style={{ marginTop: "1em" }}>
              <div style={{ fontSize: "0.95em", marginBottom: 4 }}>Shareable Link:</div>
              <input
                type="text"
                ref={shareInputRef}
                readOnly
                style={{
                  width: "97%",
                  padding: "8px",
                  fontSize: "1em",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  color: "#333",
                  marginBottom: 3,
                  background: "#f8f9fa",
                }}
              />
              <button className="btn" style={{ marginLeft: 6 }} onClick={handleCopyShare}>
                📋 Copy
              </button>
            </div>
          )}
        </section>
      </main>
      <footer className="playground-footer">
        <span>
          Powered by <a className="App-link" href="https://reactjs.org/">React</a>{" | "}
          <a className="App-link" href="https://github.com/">Source</a>
        </span>
      </footer>
    </div>
  );
}

export default App;
