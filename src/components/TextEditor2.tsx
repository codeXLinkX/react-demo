import React, { useEffect, useRef } from "react";
import { useState } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import "./tooltip.css";

// import json data from testData.json
const testData = require("./testData.json");

// const MyTooltipBlot = Quill.import("blots/inline");

// MyTooltipBlot.tagName = "span";
// MyTooltipBlot.blotName = "my-tooltip-blot";

// MyTooltipBlot.constructor = function (
//   value: any,
//   attributes: { myTooltipBlot: { tooltip: any } }
// ) {
//   let node = Object.create(MyTooltipBlot.prototype);
//   node.innerHTML = value;
//   node.dataset.tooltip = attributes.myTooltipBlot.tooltip;
//   console.log(node.dataset.tooltip);
//   return node;
// };

export const TextEditor = () => {
  const [text, setText] = useState("");
  const lastSuggestion = useRef("");
  const previousAcceptedSuggestion = useRef("");
  const lastSuggestionHasALInk = useRef(false);
  // const wordAndTooltipMapping = useRef<{ [key: string]: string }>({});
  // wordAndTooltipMapping.current["minimum"] = "word text of course";
  const prevNUmberOfWords = useRef(0);
  const quillRef = useRef<any>();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipText = useRef("");
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // useEffect(() => {
  //   Quill.register(MyTooltipBlot);
  // }, []);

  useEffect(() => {
    if (!quillRef.current) return;

    if (quillRef?.current) {
      const quill = quillRef?.current?.getEditor();
      quill?.on("selection-change", (range: { index: any; length: any }) => {
        console.log("selection-change", range);
        if (range) {
          const text = quill?.getText(range.index, range.length);
          console.log("text", text);
          if (range.length > 0) {
            //Object.keys(wordAndTooltipMapping.current).includes(text)) {
            tooltipText.current = "heyyy$$$"; //wordAndTooltipMapping.current[text];
            const bounds = quill?.getBounds(range);
            const top = Math.max(0, bounds.top + bounds.height + 90);
            const left = Math.max(0, bounds.left + bounds.width / 2 - 40);
            console.log("top", top);
            console.log("left", left);
            setTooltipPosition({
              top: top,
              left: left,
            });
            console.log("setShowTooltip true", tooltipText.current);
            setShowTooltip(true);
          } else {
            setShowTooltip(false);
          }
        } else {
          setShowTooltip(false);
        }
      });
      // quill listen to a mouse hover event over the text:
      // quillRef?.current
      //   ?.getEditor()
      //   .root.addEventListener("mouseover", (e: { target: Node }) => {
      //     let leaf = ReactQuill.Quill.find(e.target);
      //     if (leaf) {
      //       let word = leaf.text;
      //       // console.log(`You hovered over the word: ${word}`);
      //     }
      //   });
    }
  }, [quillRef]); // only run once on initial mount

  const insertCitations = (data: any, quill: any) => {
    /**
      {
      "citations": [
        "128 S. Ct. at 2105",
        "128 S. Ct. at 2106",
        "128 S. Ct. at 2107"
      ],
      "segments": [
        "the Court's question regarding the relevant statutory mandatory minimum",
        "the Court's question regarding the relevant statutory mandatory minimum",
        "the Court's question regarding the relevant statutory mandatory minimum",
        "in"
      ],
      "hyperlinks": [
        "https://cite.case.law/S.-Ct./128/2105/",
        "https://cite.case.law/S.-Ct./128/2106/",
        "https://cite.case.law/S.-Ct./128/2107/"
      ]
    }
     */
    // for a data like above, insert the citations in the quill editor and add the hyperlink to the citation. citations should go between the segments.
    const citations = data["citations"];
    const segments = data["segments"];
    const hyperlinks = data["hyperlinks"];
    const lengthOfSegments = segments.length;
    const lengthOfCitations = citations.length;
    if (lengthOfSegments < lengthOfCitations) {
      console.log("error");
      return;
    }
    let index = 0;
    for (let i = 0; i < lengthOfSegments; i++) {
      const segment = segments[i];
      const lengthOfSegment = segment.length;
      quill.insertText(index, segment);
      index += lengthOfSegment;
      if (i < lengthOfCitations) {
        const citation = citations[i];
        const citationWithUnderScore = citation
          .replaceAll(".", "")
          .replaceAll(/\s/g, "_");

        const lengthOfCitation = citationWithUnderScore.length;
        quill.insertText(index, " ");
        index += 1;
        quill.insertText(index, citationWithUnderScore, {
          link: hyperlinks[i],
          color: "grey",
          // tooltip: "toollssss",
          underline: true,
          // "my-tooltip-blot": { tooltip: "tooltip" },
        });
        // update the above insert text to add space before and after the citation
        quill.insertText(index + lengthOfCitation, " ");

        // wordAndTooltipMapping.current[citationWithUnderScore] = "yeee"; //hyperlinks[i];
        index += lengthOfCitation;
        quill.insertText(index, " ");
        index += 1;
      }
    }
  };

  const getSuggestions = async (textContent: string, quill: any) => {
    const response = await fetch("http://0.0.0.0:8000/predict/fulltext/", {
      // https://3428-158-101-122-240.ngrok.io/predict/fulltext/ http://0.0.0.0:8000/predict/fulltext/
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fulltext: textContent,
      }),
    });
    const data = testData;
    // const data = await response.json();
    console.log("data", data);
    if (
      data &&
      data["citations"] &&
      data["citations"].length > 0 &&
      quillRef.current
    ) {
      insertCitations(data, quill);
      // const firstCitation = data?.citations[0];
      // if (firstCitation === previousAcceptedSuggestion.current) return;
      // lastSuggestion.current = firstCitation;
      // lastSuggestionHasALInk.current =
      //   data?.hyperlinks && data?.hyperlinks.length > 0 && data?.hyperlinks[0];
      // const caret = quill.getSelection();
      // if (!caret) return;
      // const index = caret["index"];
      // console.log("index", index);
      // wordAndTooltipMapping.current[firstCitation] = "text of course";
      // wordAndTooltipMapping.current["minimum"] = "word text of course";
      // console.log("wordAndTooltipMapping", wordAndTooltipMapping.current);
      // quill.updateContents([
      //   {
      //     retain: index,
      //   },
      //   {
      //     insert: firstCitation,
      //     attributes: {
      //       color: "grey",
      //       tooltip: "toollssss",
      //       link: data?.hyperlinks[0],
      //       showTooltip: true,
      //       underline: true,
      //       "my-tooltip-blot": { tooltip: "tooltip" },
      //     },
      //   },
      // ]);
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
            quill.updateContents([
              {
                retain: quill.getLength() - 1,
              },
              {
                insert: " ",
              },
            ]);
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
        className="my-tooltip-blot"
      />
      {showTooltip && (
        <div
          className="tooltip"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          {tooltipText.current}
        </div>
      )}
      <style>
        {`.my-tooltip-blot:hover:after {
            content: attr(data-tooltip);
            position: absolute;
            background-color: #000;
            color: #fff;
            padding: 0.2em;
          }`}
      </style>
    </div>
  );
};
