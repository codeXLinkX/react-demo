import React, { useEffect, useRef } from "react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  insertCitations,
  handleAcceptCitation,
  handleDiscardCitation,
} from "./helpers";
import "./tooltip.css";
import { FaCheck, FaTimes } from "react-icons/fa";

// create a data structure that will hold the citation data:
// citations, hyperlinks, fragments:
class Citations {
  citations: string[];
  hyperlinks: string[];
  fragments: string[];
  constructor(citations: string[], hyperlinks: string[], fragments: string[]) {
    this.citations = citations;
    this.hyperlinks = hyperlinks;
    this.fragments = fragments;
  }
}

export const TextEditor3 = () => {
  const [text, setText] = useState("");
  const [data, setData] = useState(Object);
  const lastSuggestion = useRef("");
  const previousAcceptedSuggestion = useRef("");
  const lastSuggestionHasALInk = useRef(false);
  const prevNUmberOfWords = useRef(0);
  const quillRef = useRef<any>();
  const pRef = useRef<any>();
  const citationList = useRef<any>({});
  const [acceptedCitations, setAcceptedCitations] = useState<any>([]);
  const [deletedCitations, setDeletedCitations] = useState<any>([]);
  const [citations, setCitations] = useState<Citations>();

  useEffect(() => {
    // write code to listen to the mouse hover on individual words in the quill editor and print the word to the console:
    const quill = quillRef?.current?.getEditor();
    // add a mouseover event listener to the quill editor:
    quill.on("mouseover", (range: any, oldRange: any, source: any) => {
      const word = quill.getText(range.index, range.length);
      console.log("word", word);
    });
  }, [quillRef]);

  useEffect(() => {
    const quill = quillRef?.current?.getEditor();
    // const citations = new Citations(data?.citations, data?.hyperlinks, data?.fragments);
    if (
      data &&
      data["citations"] &&
      data["citations"]?.length > 0 &&
      quillRef.current
    ) {
      const listOfRanges = insertCitations(data, quill);
      console.log("listOfRanges", listOfRanges);
      citationList.current = listOfRanges;
      setText(quill.getText());
      setCitations(
        new Citations(
          data?.citations,
          data?.hyperlinks || ["https://www.google.com"],
          data?.fragments
        )
      );
    }
  }, [data]);

  const getSuggestions = async (textContent: string) => {
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
    const responseData = await response.json();
    console.log("responseData", responseData);
    responseData["hyperlinks"] = [
      "https://www.google.com",
      "https://www.yahoo.com",
      "https://www.bing.com",
    ];
    return responseData;
  };

  const didUserPasteLargeText = (delta: any) => {
    const lastInsert = delta?.ops?.[0]?.insert;
    if (lastInsert && typeof lastInsert === "string") {
      const numberOfWords = lastInsert.split(" ").length;
      if (numberOfWords > 3) {
        console.log("User pasted large text: num words: ", numberOfWords);
        return true;
      }
    }
    console.log("User did not paste large text");
    return false;
  };

  const isSuggestionAtEndOfText = (responseData: any) => {
    const isItAtTheEnd =
      (responseData["fragments"] || responseData["segments"]).length === 1 &&
      responseData["citations"].length === 1;
    console.log("isItAtTheEnd: ", isItAtTheEnd);
    return isItAtTheEnd;
  };

  const handleChange = async (value: string, delta: any, source: string) => {
    console.log("Some change happened: source: ", source, delta);
    console.log("source", source);

    // check if the change happened because user pasted text and print the pasted text:
    if (delta?.ops?.[0]?.insert?.["\n"]) {
      console.log("I think it is a paste??");
      console.log("delta", delta);
      console.log("delta.ops[0].insert", delta.ops[0].insert);
    }

    if (source === "api") {
      console.log("source is api -- RETURNING");
      return;
    }

    const quill = quillRef?.current?.getEditor();
    if (source === "user" && lastSuggestion.current != "") {
      // if user keeps typing, delete the last suggestion:
      console.log(
        "source is user and lastSuggestion is not empty. Deleting last suggestion"
      );
      const lastSuggestionLength = lastSuggestion.current.length;
      lastSuggestion.current = "";
      quill.deleteText(
        quill.getLength() - (lastSuggestionLength + 1),
        lastSuggestionLength,
        "api"
      );
      return;
    }

    const textContent = quill?.root?.textContent;

    // if we already have a suggestion waiting to be approved or discarded, don't send another request:
    if (lastSuggestion.current != "") {
      return;
    }

    const didUserPaste = didUserPasteLargeText(delta);

    console.log("getSuggestions");
    const responseData = await getSuggestions(textContent);
    const isSuggestionAtEnd = isSuggestionAtEndOfText(responseData);

    if (!didUserPaste && !isSuggestionAtEnd) {
      console.log(
        "user didn't past a large text and the suggestion is not at the end of the text"
      );
      return;
    }

    // if the last character of the textContent is not space, return:
    if (!didUserPaste && textContent[textContent.length - 1] !== " ") {
      return;
    }

    console.log("getSuggestions");

    setData(responseData);
  };

  return (
    <div
      ref={pRef}
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
      {/* {tooltipList.length > 0 && (
        <div
          className="tooltip"
          style={{
            top: tooltipList[0]["top"],
            left: tooltipList[0]["left"],
          }}
        >
          {tooltipList[0]["text"]}
        </div>
      )} */}
      <div
        // add styles to this div to have 2 elements side by side in a row:
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <ReactQuill
          style={{ width: "60%" }}
          ref={quillRef}
          defaultValue={text}
          // value={quillRef?.current?.getText || text}
          onChange={handleChange}
          placeholder="Compose a case..."
        />
        <div style={{ width: "40%", marginLeft: "10px" }}>
          {citations?.citations
            ?.filter(
              (citation) =>
                acceptedCitations?.indexOf(citation) == -1 &&
                deletedCitations?.indexOf(citation) == -1
            )
            ?.map((citation, index) => {
              // display the citation with the corresponding hyperlink, and with 2 buttons: accept and discard. the buttons will be displayed on the right side of the citation.
              // buttons should have the corresponding icons (check and x):
              return (
                <div
                  key={index}
                  onMouseEnter={() => {
                    const quill = quillRef?.current?.getEditor();
                    const textContent = quill?.root?.textContent;
                    const index = textContent.indexOf(citation);
                    if (index >= 0) {
                      quill.formatText(index, citation.length, {
                        background: "lightblue",
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    const quill = quillRef?.current?.getEditor();
                    const textContent = quill?.root?.textContent;
                    const index = textContent.indexOf(citation);
                    if (index >= 0) {
                      quill.formatText(index, citation.length, {
                        background: "white",
                      });
                    }
                  }}
                  onTouchMove={() => console.log("Here", citation)}
                  style={{
                    borderRadius: "20px",
                    margin: "5px",
                    borderBottomWidth: "1px",
                    borderWidth: "0px",
                    borderStyle: "solid",
                    borderBottomColor: "lightgrey",
                    padding: "20px 15px",
                    backgroundColor: "#F7F7F761",
                    borderColor: "black",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>{citation}</div>

                    <div>
                      <button
                        onMouseEnter={(ev) => {
                          const target = ev.target;
                          if (target instanceof HTMLElement) {
                            target.style.backgroundColor = "#04FE00AD";
                          }
                        }}
                        onMouseLeave={(ev) => {
                          const target = ev.target;
                          if (target instanceof HTMLElement) {
                            target.style.backgroundColor = "white";
                          }
                        }}
                        style={{
                          marginRight: "10px",
                          borderRadius: "20%",
                          borderWidth: "0.2px",
                          padding: "5px",
                          backgroundColor: "white",
                          borderColor: "lightgrey",
                        }}
                        onClick={() => {
                          handleAcceptCitation(
                            citation,
                            quillRef,
                            citationList,
                            setAcceptedCitations,
                            acceptedCitations
                          );
                          console.log(
                            " handleAcceptCitation citation",
                            citation
                          );
                        }}
                      >
                        <FaCheck />
                      </button>
                      <button
                        onMouseEnter={(ev) => {
                          const target = ev.target;
                          if (target instanceof HTMLElement) {
                            target.style.backgroundColor = "#FF0000B6";
                          }
                        }}
                        onMouseLeave={(ev) => {
                          const target = ev.target;
                          if (target instanceof HTMLElement) {
                            target.style.backgroundColor = "white";
                          }
                        }}
                        style={{
                          borderRadius: "20%",
                          borderWidth: "0.2px",
                          borderColor: "lightgrey",
                          padding: "5px",
                          backgroundColor: "white",
                        }}
                        onClick={() => {
                          handleDiscardCitation(
                            citation,
                            quillRef,
                            citationList,
                            setDeletedCitations,
                            deletedCitations
                          );
                          console.log("citation", citation);
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                  <div>{citations?.hyperlinks[index]}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
