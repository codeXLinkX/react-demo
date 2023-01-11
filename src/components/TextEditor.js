import React from "react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// create a quill text editor component that makes a fetch request to the server when the text is changed
// and display what the server returns in the text editor at the bottom with a different color:

export const TextEditor = () => {
  const [text, setText] = useState("");
  const [serverData, setServerText] = useState(null);

  const handleChange = async (value: string) => {
    let val = value.replace("<p>", "").replace("</p>", "");
    console.log("val", val);
    setText(value);
    const response = await fetch("http://0.0.0.0:8000/predict/fulltext/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fulltext: val,
      }),
    });
    const data = await response.json();
    console.log("data", data);
    setServerText(data);
  };

  return (
    <div>
      <ReactQuill value={text} onChange={handleChange} />
      <div>Citations: {serverData ? ["citations"] : ""}</div>
      <div>Hyperlinks: {serverData ? ["hyperlinks"] : ""}</div>
    </div>
  );
};
