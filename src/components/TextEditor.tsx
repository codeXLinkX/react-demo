import React, { useEffect, useRef } from "react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export const TextEditor = () => {
  const [text, setText] = useState("");
  const lastSuggestion = useRef("");
  const previousAcceptedSuggestion = useRef("");
  const lastSuggestionHasALInk = useRef(false);
  const prevNUmberOfWords = useRef(0);

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

  const getSuggestions = async (textContent: string, quill: any) => {
    const response = await fetch(
      "https://3428-158-101-122-240.ngrok.io/predict/fulltext/",
      {
        // https://3428-158-101-122-240.ngrok.io/predict/fulltext/ http://0.0.0.0:8000/predict/fulltext/
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulltext: textContent,
        }),
      }
    );
    const data = await response.json();
    console.log("data", data);
    if (
      data &&
      data["citations"] &&
      data["citations"].length > 0 &&
      quillRef.current
    ) {
      const firstCitation = data?.citations[0];
      if (firstCitation === previousAcceptedSuggestion.current) return;
      lastSuggestion.current = firstCitation;
      lastSuggestionHasALInk.current =
        data?.hyperlinks && data?.hyperlinks.length > 0 && data?.hyperlinks[0];
      const caret = quill.getSelection();
      if (!caret) return;
      const index = caret["index"];
      console.log("index", index);
      quill.updateContents([
        {
          retain: index,
        },
        {
          insert: firstCitation,
          attributes: {
            color: "grey",
            link: data?.hyperlinks[0],
            // add underscore
            // underline: true,
          },
        },
      ]);
    }
    console.log("lastSuggestion", lastSuggestion);
  };

  const handleChange = async (value: string, delta: any, source: string) => {
    console.log("WE ARE IN HANDLE ON CHANGE");
    console.log("lastSuggestion", lastSuggestion.current);

    if (source === "api") {
      console.log("source is api -- RETURNING");
      return;
    }
    // if the source is user and the last key pressed is not tab, that means user didn't accept the last suggestion.
    // in that case, remove the last suggestion from the editor:
    const quill = quillRef?.current?.getEditor();
    if (source === "user" && lastSuggestion.current != "") {
      console.log("DELETING LAST SUGGESTION");
      const lastSuggestionLength = lastSuggestion.current.length;
      lastSuggestion.current = "";
      quill.deleteText(
        quill.getLength() - (lastSuggestionLength + 1),
        lastSuggestionLength,
        "api"
      );
      return;
    }

    console.log("source", source);

    const textContent = quill?.root?.textContent;
    console.log("number of words", textContent.split(" ").length, textContent);

    setText(value);
    // if we already have a suggestion waiting to be approved or discarded, don't send another request:
    if (lastSuggestion.current != "") {
      return;
    }
    // if the last character of the textContent is not space, return:
    if (textContent[textContent.length - 1] !== " ") {
      return;
    }

    await getSuggestions(textContent, quill);
  };
  return (
    <div
      onKeyDownCapture={(ev) => {
        if (ev.key === "Tab") {
          console.log("tab was hit", lastSuggestion.current);
          ev.preventDefault();
          ev.stopPropagation();
          const quill = quillRef?.current?.getEditor();
          if (
            lastSuggestion.current != "" &&
            lastSuggestion.current != undefined
          ) {
            console.log("lastSuggestion", lastSuggestion.current);
            // turn the pending suggestion word color from grey to black:
            quill.formatText(
              quill.getLength() - (lastSuggestion.current.length + 1),
              lastSuggestion.current.length,
              { color: lastSuggestionHasALInk.current ? "blue" : "black" },
              "api"
            );
            previousAcceptedSuggestion.current = lastSuggestion.current;
            lastSuggestion.current = "";
            lastSuggestionHasALInk.current = false;
            const textContent = quill?.root?.textContent;
            prevNUmberOfWords.current = textContent.split(" ").length;
          }
          quill.setSelection(quill.getLength() - 1, 0, "api");
        }
      }}
    >
      <ReactQuill
        ref={quillRef}
        value={text}
        onChange={handleChange}
        // onKeyDown={handleKeyDown}
        // onKeyPress={handleKeyPress}
        placeholder="Compose a case..."
      />
    </div>
  );
};
