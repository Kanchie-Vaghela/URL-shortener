import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

  async function fetchUrls() {
    try {
      const res = await api.get("/shorten");
      setUrls(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShorten() {
    setError("");
    setLoading(true);
    try {
      await api.post("/shorten", { url: longUrl });
      setLongUrl("");
      fetchUrls();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(code) {
    try {
      await api.delete(`/shorten/${code}`);
      fetchUrls();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Your URLs</h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="https://example.com"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleShorten}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#1a1a2e",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <th style={{ padding: "1rem", textAlign: "left" }}>Short Code</th>
            <th style={{ padding: "1rem", textAlign: "left" }}>Original URL</th>
            <th style={{ padding: "1rem", textAlign: "center" }}>Clicks</th>
            <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url, i) => (
            <tr
              key={url.short_code}
              style={{
                borderBottom: "1px solid #eee",
                background: i % 2 === 0 ? "#fff" : "#f9f9f9",
              }}
            >
              <td style={{ padding: "1rem" }}>
                <a
                  href={`${import.meta.env.VITE_API_URL}/${url.short_code}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {" "}
                  {url.short_code}
                </a>
              </td>
              <td
                style={{
                  padding: "1rem",
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {url.original_url}
              </td>
              <td style={{ padding: "1rem", textAlign: "center" }}>
                {url.click_count}
              </td>
              <td
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => navigate(`/analytics/${url.short_code}`)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Analytics
                </button>
                <button
                  onClick={() => handleDelete(url.short_code)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: "#e94560",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {urls.length === 0 && (
            <tr>
              <td
                colSpan="4"
                style={{ padding: "2rem", textAlign: "center", color: "#999" }}
              >
                No URLs yet. Shorten one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
