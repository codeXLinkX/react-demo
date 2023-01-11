import React, { useState, useEffect } from "react";
import { TextEditor } from "./components/TextEditor";

function App() {
  const url = "https://3428-158-101-122-240.ngrok.io/predict/fulltext/";
  // const local_url = "http://127.0.0.1:8000/predict/fulltext/";
  const [data, setData] = useState(null);
  const text =
    "the Court's question regarding the relevant statutory mandatory minimum in";
  async function fetchData() {
    console.log("fetching now");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fulltext: text,
      }),
    });
    const json = await response.json();
    console.log(json);
    setData(json);
  }

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Text</h1>
      <TextEditor />
      <p>{text}</p>
      <button onClick={fetchData}>Get citations</button>
      {data ? (
        <div>
          <p>Citations: {data["citations"]}</p>
          <p>Hyperlinks: {data["hyperlinks"]}</p>
        </div>
      ) : null}
    </div>
  );
}

export default App;
