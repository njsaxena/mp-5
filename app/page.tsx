"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setShortUrl("");
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, alias }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setShortUrl(`${window.location.origin}/${data.alias}`);
      setUrl("");
      setAlias("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
  }

  return (
      <main className="container">
        <div className="card">
          <h1>Link Shortener</h1>
          <p className="subtitle">
            Shorten your link
          </p>

          <form onSubmit={handleSubmit}>
            <label>Original URL</label>
            <input
                type="text"
                placeholder="https://example.com/very-long-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
            />

            <label>Custom Alias</label>
            <input
                type="text"
                placeholder="my-link"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Shortening..." : "Shorten URL"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          {shortUrl && (
              <div className="result">
                <p>Your shortened URL:</p>
                <div className="result-row">
                  <a href={shortUrl} target="_blank">
                    {shortUrl}
                  </a>
                  <button type="button" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
          )}
        </div>
      </main>
  );
}
