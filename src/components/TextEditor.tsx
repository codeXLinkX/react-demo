import React, { useEffect, useRef } from "react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export const TextEditor = () => {
  const [text, setText] = useState("");
  const [serverData, setServerText] = useState(null);
  const [justCalledAPI, setJustCalledAPI] = useState(false);

  // create a ref for the quill text editor:
  const quillRef = useRef<any>();
  // const quillRef = useRef(null);

  useEffect(() => {
    if (!quillRef.current) return;
    if (quillRef.current) {
      const quill = quillRef?.current?.getEditor();
      quill.keyboard.addBinding(
        {
          key: "Tab",
          shiftKey: true,
        },
        function () {
          return false;
        }
      );
    }
  }, [quillRef]); // only run once on initial mount

  const handleKeyDown = (event: any) => {
    if (event.key === "Tab") {
      console.log("tab pressed");
      event.preventDefault();
      // if Tab was pressed, don't change the text.
      // Bring the caret to the end of the line:
      const quill = quillRef?.current?.getEditor();
      quill.setSelection(quill.getLength() - 1, 0, "silent");
    }
  };

  const handleKeyPress = (event: any) => {
    console.log("handleKeyPress pressed", event.key);
    if (event.key === "Tab") {
      console.log("handleKeyPress tab pressed");
      event.preventDefault();
    }
  };

  const handleChange = async (value: string, delta: any, source: string) => {
    console.log("source", source);
    if (source === "api") {
      return;
    }
    console.log("WE ARE IN HANDLE ON CHANGE");
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
    // setServerText(data);
    if (data && data["citations"] && quillRef.current) {
      const quill = quillRef?.current?.getEditor();
      const caret = quill.getSelection();
      if (!caret) return;
      const index = caret["index"];
      console.log("index", index);
      quill.updateContents([
        {
          retain: index,
        },
        {
          // retain: index,
          insert: " " + data["citations"][0],
          attributes: { color: "grey", link: data["hyperlinks"][0] },
          // index: index,
        },
      ]);
      console.log("updated content", index);
      // quill.updateContents(
      //   new Delta()
      //     .retain(6) // Keep 'Hello '
      //     .delete(5) // 'World' is deleted
      //     .insert("Quill")
      //     .retain(1, { bold: true }) // Apply bold to exclamation mark
      // );
      // quill.updateContents();
      // quill.insertText(
      //   index,
      //   " " + data["citations"][0],
      //   {
      //     color: "grey",
      //     italic: true,
      //   },
      //   "api"
      // );
    }
    // setJustCalledAPI(true);
  };

  // append the server data text to the quill text editor but with grey color:
  // const greyText = (text) => {
  //   return (
  //     <span style={{ color: "grey" }}>
  //       {text}
  //     </span>
  //   );
  // }

  // const finalText = (
  //   <p>
  //     {text}
  //     <span style={{ color: "grey" }}>{serverData ? ["citations"] : ""}</span>
  //   </p>
  // );

  // return the quill text editor and the server data text:
  // return (
  //   <div>
  //     <ReactQuill value={text} onChange={handleChange} />

  const bindings = {
    // This will overwrite the default binding also named 'tab'
    tab: {
      key: 9,
      handler: function () {
        console.log("tab pressed bindings");
        return false;
      },
    },
  };
  const mods = {
    keyboard: {
      bindings: bindings,
    },
  };
  return (
    <div
      onKeyDownCapture={(ev) => {
        if (ev.key === "Tab") {
          ev.preventDefault();
          ev.stopPropagation();
          const quill = quillRef?.current?.getEditor();
          quill.setSelection(quill.getLength() - 1, 0, "silent");
        }
      }}
    >
      <ReactQuill
        ref={quillRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyPress={handleKeyPress}
        placeholder="Compose a case..."
        // modules={mods}
      />
      {/* <div>Citations: {serverData ? ["citations"] : ""}</div>
      <div>Hyperlinks: {serverData ? ["hyperlinks"] : ""}</div> */}
    </div>
  );
};
