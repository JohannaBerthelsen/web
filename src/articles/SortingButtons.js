import { useState } from "react";
import * as s from "./SortingButtons.sc";

export default function SortingButtons({
  articleList,
  setArticleList,
  originalList,
}) {
  const [difficultySortState, setCurrentSort] = useState("");
  const [wordCountSortState, setwordCountSortState] = useState("");

  function sortArticleList(sorting) {
    setArticleList([...articleList].sort(sorting));
  }

  function changeDifficultySorting(
    e,
    currentSort,
    setCurrentSort,
    setOtherSort,
    sortingFunction
  ) {
    if (currentSort === "ascending") {
      sortArticleList(sortingFunction);
      setCurrentSort("descending");
      setOtherSort("");
    } else if (currentSort === "descending") {
      setArticleList(originalList);
      setCurrentSort("");
    } else {
      sortArticleList((a, b) => 0 - sortingFunction(a, b));
      setCurrentSort("ascending");
      setOtherSort("");
    }
  }

  return (
    <s.SortingButtons>
      Sort by:&nbsp;
      <s.SortButton
        className={wordCountSortState}
        onClick={(e) =>
          changeDifficultySorting(
            e,
            wordCountSortState,
            setwordCountSortState,
            setCurrentSort,
            (a, b) => b.metrics.word_count - a.metrics.word_count
          )
        }
      >
        Words
      </s.SortButton>
      <s.SortButton
        className={difficultySortState}
        onClick={(e) =>
          changeDifficultySorting(
            e,
            difficultySortState,
            setCurrentSort,
            setwordCountSortState,
            (a, b) => b.metrics.difficulty - a.metrics.difficulty
          )
        }
      >
        Difficulty
      </s.SortButton>
    </s.SortingButtons>
  );
}