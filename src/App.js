import React, { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState(null);
  const text =
    "the Court's question regarding the relevant statutory mandatory minimum in";
  async function fetchData() {
    console.log("fetching now");
    const response = await fetch("http://0.0.0.0:8000/predict/fulltext/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fulltext: text,
      }),
    });
    // const response = await fetch("http://0.0.0.0:8000/predict/fulltext/");
    const json = await response.json();
    console.log(json);
    setData(json);
  }

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://0.0.0.0:8000/predict/fulltext/");
      const json = await response.json();
      setData(json);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Text</h1>
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
