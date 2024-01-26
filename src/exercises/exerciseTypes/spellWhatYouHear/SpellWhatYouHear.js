import {useState, useEffect, useContext} from "react";
import * as s from "../Exercise.sc.js";
import BottomInput from "../findWordInContext/BottomInput.js";
import SpeakButton from "../SpeakButton";
import strings from "../../../i18n/definitions";
import NextNavigation from "../NextNavigation";
import SolutionFeedbackLinks from "../SolutionFeedbackLinks";

import { TranslatableText } from "../../../reader/TranslatableText.js";
import InteractiveText from "../../../reader/InteractiveText.js";
import LoadingAnimation from "../../../components/LoadingAnimation.js";
import {SpeechContext} from "../../SpeechContext";
import DisableAudioSession from "../DisableAudioSession.js"

const EXERCISE_TYPE = "Spell_What_You_Hear";
export default function SpellWhatYouHear({
  api,
  bookmarksToStudy,
  correctAnswer,
  notifyIncorrectAnswer,
  setExerciseType,
  isCorrect,
  setIsCorrect,
  moveToNextExercise,
  toggleShow,
  reload,
  setReload,
  exerciseSessionId
}) {
  const [initialTime] = useState(new Date());
  const [firstTypeTime, setFirstTypeTime] = useState();
  const [messageToAPI, setMessageToAPI] = useState("");
  const bookmarkToStudy = bookmarksToStudy[0];
  const speech = useContext(SpeechContext);
  const [interactiveText, setInteractiveText] = useState();
  const [articleInfo, setArticleInfo] = useState();

  async function handleSpeak() {
    await speech.speakOut(bookmarkToStudy.from);
  }

  // Timeout is set so that the page renders before the word is spoken, allowing for the user to gain focus on the page
  useEffect(() => {
    setExerciseType(EXERCISE_TYPE);
    setTimeout(() => {
      handleSpeak();
    }, 500);
    api.getArticleInfo(bookmarksToStudy[0].article_id, (articleInfo) => {
      setInteractiveText(
        new InteractiveText(
          bookmarksToStudy[0].context,
          articleInfo,
          api,
          "TRANSLATE WORDS IN EXERCISE"
        )
      );
      setArticleInfo(articleInfo);
    });
    if (sessionStorage.audioEnabled === "false")
      handleDisabledAudio()
  }, []);


  function inputKeyPress() {
    if (firstTypeTime === undefined) {
      setFirstTypeTime(new Date());
    }
  }

  if (!articleInfo) {
    return <LoadingAnimation />;
  }

  function handleShowSolution(e, message) {
    e.preventDefault();
    let pressTime = new Date();
    console.log(pressTime - initialTime);
    console.log("^^^^ time elapsed");
    let duration = pressTime - initialTime;
    let concatMessage;
    if (!message) {
      concatMessage = messageToAPI + "S";
    } else {
      concatMessage = message;
    }

    notifyIncorrectAnswer(bookmarksToStudy[0]);
    setIsCorrect(true);
    api.uploadExerciseFinalizedData(
      concatMessage,
      EXERCISE_TYPE,
      duration,
      bookmarksToStudy[0].id,
      exerciseSessionId
    );
  }

  function disableAudio(e){
    e.preventDefault();
    sessionStorage.audioEnabled = false;
    handleShowSolution(e, "DisableAudioSession");
  }

  function exerciseDuration(endTime) {
    return Math.min(89999, endTime - initialTime)
}

  function handleDisabledAudio() {
    let pressTime = new Date();
    let duration = exerciseDuration(pressTime);
    let message = messageToAPI + "D";

    notifyIncorrectAnswer(bookmarksToStudy[0]);
    handleAnswer(message, duration);
    moveToNextExercise();
  }

  function handleShowSolution() {
    let pressTime = new Date();
    let duration = exerciseDuration(pressTime);
    let message = messageToAPI + "S";

    notifyIncorrectAnswer(bookmarksToStudy[0]);
    setIsCorrect(true);
    handleAnswer(message, duration);
  }

  function handleIncorrectAnswer() {
    notifyIncorrectAnswer(bookmarksToStudy[0]);
    setFirstTypeTime(new Date());
  }

  function handleAnswer(message) {
    let pressTime = new Date();

    api.uploadExerciseFinalizedData(
        message,
        EXERCISE_TYPE,
        exerciseDuration(pressTime),
        bookmarksToStudy[0].id,
        exerciseSessionId
    );
  }

  function handleCorrectAnswer(message) {
    let duration = exerciseDuration(firstTypeTime);

    correctAnswer(bookmarksToStudy[0]);
    setIsCorrect(true);
    api.uploadExerciseFinalizedData(
        message,
        EXERCISE_TYPE,
        duration,
        bookmarksToStudy[0].id,
        exerciseSessionId
    );
}

  return (
    <s.Exercise>
      <div className="headline">{strings.audioExerciseHeadline}</div>
      {!isCorrect && (
        <>
          <div className="contextExample">
            <TranslatableText
              isCorrect={isCorrect}
              interactiveText={interactiveText}
              translating={true}
              pronouncing={false}
              bookmarkToStudy={bookmarksToStudy[0].from}
            />
          </div>
          <s.CenteredRowTall>
            <SpeakButton
              bookmarkToStudy={bookmarkToStudy}
              api={api}
              styling="large"
            />
          </s.CenteredRowTall>

          <BottomInput
            handleCorrectAnswer={handleCorrectAnswer}
            handleIncorrectAnswer={handleIncorrectAnswer}
            bookmarksToStudy={bookmarksToStudy}
            notifyKeyPress={inputKeyPress}
            messageToAPI={messageToAPI}
            setMessageToAPI={setMessageToAPI}
          />
        </>
      )}
      {isCorrect && (
        <>
          <br></br>
          <h1 className="wordInContextHeadline">{bookmarksToStudy[0].to}</h1>
          <div className="contextExample">
            <TranslatableText
              isCorrect={isCorrect}
              interactiveText={interactiveText}
              translating={true}
              pronouncing={false}
              bookmarkToStudy={bookmarksToStudy[0].from}
            />
          </div>
          <NextNavigation
            api={api}
            bookmarksToStudy={bookmarksToStudy}
            moveToNextExercise={moveToNextExercise}
            reload={reload}
            setReload={setReload}
          />
        </>
      )}
      <SolutionFeedbackLinks
        handleShowSolution={handleShowSolution}
        toggleShow={toggleShow}
        isCorrect={isCorrect}
      />
      {sessionStorage.audioEnabled === "true" && 
            <DisableAudioSession
              disableAudio={disableAudio}
            />}
    </s.Exercise>
  );
}
