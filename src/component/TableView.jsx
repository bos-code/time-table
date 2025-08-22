import React, { useState } from "react";

export default function TimetableView() {
  const [response, setResponse] = useState(null);

  async function sendTestJson() {
    const payload = [
      {
        teacher: "Misachidaira",
        subjects: [
          { name: "Maths", class: "A7" },
          { name: "English", class: "A9" },
        ],
      },
    ];

    try {
      const res = await fetch("http://127.0.0.1:8000/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Error sending JSON:", err);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Send JSON to FastAPI</h2>
      <button onClick={sendTestJson}>Send JSON</button>

      {response && (
        <pre
          style={{ marginTop: "20px", background: "#f4f4f4", padding: "10px" }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
