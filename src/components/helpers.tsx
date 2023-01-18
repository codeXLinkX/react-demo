import { Dispatch, MutableRefObject, SetStateAction } from "react";

const wordWithoutLink = {
  underline: false,
  link: null,
  color: "black",
};
export const insertCitations = (data: any, quill: any): any[] => {
  console.log("inserting citations");
  const citations = data["citations"];
  const segments = data["fragments"] || data["segments"];
  const hyperlinks = data["hyperlinks"];
  const lengthOfSegments = segments.length;
  const lengthOfCitations = citations.length;
  const listOfRanges: any = {};
  if (lengthOfSegments < lengthOfCitations) {
    console.log("error");
    return [];
  }
  quill.setContents([{ insert: "\n" }]);
  let index = 0;
  for (let i = 0; i < lengthOfSegments; i++) {
    const segment = segments[i];
    const lengthOfSegment = segment.length;
    quill.insertText(index, segment, wordWithoutLink);
    index += lengthOfSegment;
    if (i < lengthOfCitations) {
      const citation = citations[i];
      // const citationWithUnderScore = citation
      //   .replaceAll(".", "")
      //   .replaceAll(/\s/g, "_");

      const lengthOfCitation = citation.length;
      quill.insertText(index, " ", wordWithoutLink);
      index += 1;

      const range = quill.getSelection() || quill.getLeaf(index - 1)[1];
      console.log("#### range ##### ", range);
      if (range) {
        console.log("range", range);
        const bounds = quill?.getBounds(range);
        const top = Math.max(0, bounds?.top + bounds?.height + 90);
        const left = Math.max(0, bounds?.left + bounds?.width / 2 - 40);
        listOfRanges[citation] = {
          text: citation,
          hyperlink: hyperlinks[i],
          top: top,
          left: left,
          index: index,
          length: lengthOfCitation,
        };
      }
      quill.insertText(index, citation, {
        link: hyperlinks[i],
        color: "grey",
        underline: true,
      });
      // update the above insert text to add space before and after the citation
      quill.insertText(index + lengthOfCitation, " ", wordWithoutLink);
      index += lengthOfCitation;
      quill.insertText(index, " ", wordWithoutLink);
      index += 1;
    }
  }
  return listOfRanges;
};

export const insertCitationAtTheEnd = (
  data: any,
  quill: any,
  previousAcceptedSuggestion: any,
  lastSuggestion: any,
  lastSuggestionHasALInk: any
) => {
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
        underline: true,
      },
    },
  ]);
};

export const handleAcceptCitation = (
  citation: any,
  quillRef: any,
  citationList: any,
  setAcceptedCitations: any,
  acceptedCitations: any
) => {
  const quill = quillRef?.current?.getEditor();
  const range = citationList.current[citation];
  if (range?.index) {
    quill.formatText(
      range.index,
      range.length,
      { color: "blue", background: "white" },
      "api"
    );
    setAcceptedCitations([...acceptedCitations, citation]);
  } else {
    console.log("No range for handleAcceptCitation", range);
  }
};

export const handleDiscardCitation = (
  citation: any,
  quillRef: any,
  citationList: any,
  setDeletedCitations: any,
  deletedCitations: any
) => {
  const quill = quillRef?.current?.getEditor();
  const range = citationList.current[citation];
  if (range?.index) {
    quill.deleteText(range.index - 1, range.length + 1, "api");
    setDeletedCitations([...deletedCitations, citation]);
  } else {
    console.log("No range for handleDiscardCitation", range);
  }
};
