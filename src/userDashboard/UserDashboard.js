import { useEffect, useState } from "react";
import LoadingAnimation from "../components/LoadingAnimation";
import TranslatedWordsGraph from "./userdashboard_Graphs/TranslatedWordsGraph";
import ReadingAndExercisesTimeGraph from "./userdashboard_Graphs/ReadingAndExercisesTimeGraph";
import {
  PERIOD_OPTIONS,
  ACTIVITY_TIME_FORMAT_OPTIONS,
  OPTIONS,
  TABS_IDS,
} from "./ConstantsUserDashboard";
import {
  getLineGraphData,
  calculateCountPerMonth_Words,
  getMapData,
} from "./userdashboard_Graphs/dataFormat/TranslatedWordsDataFormat";
import {
  getBarGraphData,
  calculateCountPerMonth_Activity,
} from "./userdashboard_Graphs/dataFormat/ReadingAndExercisesTimeDataFormat";
import UserDashboardTop from "./userDashboard_Top/UserDashboardTop";
import * as s from "./userDashboard_Styled/UserDashboard.sc";

export default function UserDashboard({ api }) {
  const [activeTab, setActiveTab] = useState(TABS_IDS.BAR_GRAPH);
  const [activeTimeInterval, setActiveTimeInterval] = useState(OPTIONS.WEEK);
  const [activeCustomTimeInterval, setActiveCustomTimeInterval] = useState(
    PERIOD_OPTIONS.WEEK
  );
  const [activeTimeFormatOption, setActiveTimeFormatOption] = useState(
    ACTIVITY_TIME_FORMAT_OPTIONS.MINUTES
  );
  const [allWordsData, setAllWordsData] = useState(null);
  const [allWordsDataPerMonths, setAllWordsDataPerMonths] = useState({});
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [dailyExerciseAndReadingTimes, setDailyExerciseAndReadingTimes] =
    useState(null);
  const [monthlyExerciseAndReadingTimes, setMonthlyExerciseAndReadingTimes] =
    useState({});

  function handleChangeReferenceDate(newDate) {
    setReferenceDate(newDate);
    api.logUserActivity(api.USER_DASHBOARD_DATE_CHANGE, "", newDate);
  }

  function handleActiveTabChange(tabId) {
    setActiveTab(tabId);
    api.logUserActivity(api.USER_DASHBOARD_TAB_CHANGE, "", tabId);
  }

  function calculateStreak(activityData) {
    const today = new Date();
    let streak = 0;
  
    // Get the activity keys (dates) and sort them in descending order (latest first)
    const activityDates = Object.keys(activityData).sort((a, b) => new Date(b) - new Date(a));
  
    // Loop through the dates and check for consecutive days
    for (let i = 0; i < activityDates.length; i++) {
      const currentDay = new Date(activityDates[i]);
  
      // Check if it's the first date or the previous day was consecutive
      if (i === 0) {
        // If this is the first day, check if it matches today's date
        const isToday = currentDay.toDateString() === today.toDateString();
  
        // If today is logged, start the streak, otherwise, break the loop
        if (isToday) {
          streak++;
        } else {
          break; // No streak if today isn't counted
        }
      } else {
        const previousDay = new Date(activityDates[i - 1]);
        const differenceInTime = previousDay - currentDay;
        const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24); // Convert to days
  
        if (differenceInDays === 1) {
          // If the previous day is exactly 1 day before, increment streak
          streak++;
        } else {
          break; // Streak ends if there is a gap
        }
      }
    }
  
    return streak;
  }

  function handleActiveTimeIntervalChange(selected) {
    setActiveTimeInterval(selected);
    api.logUserActivity(api.USER_DASHBOARD_PERIOD_CHANGE, "", selected);

    var period =
      selected === OPTIONS.WEEK || selected === OPTIONS.CUSTOM_WEEK
        ? PERIOD_OPTIONS.WEEK
        : selected === OPTIONS.MONTH || selected === OPTIONS.CUSTOM_MONTH
        ? PERIOD_OPTIONS.MONTH
        : selected === OPTIONS.YEAR || selected === OPTIONS.CUSTOM_YEAR
        ? PERIOD_OPTIONS.YEAR
        : selected === OPTIONS.YEARS
        ? PERIOD_OPTIONS.YEARS
        : PERIOD_OPTIONS.WEEK;

    // if it's last week/month/year/years,
    //set the date to today's date and show time in minutes
    if (
      selected === OPTIONS.WEEK ||
      OPTIONS.MONTH ||
      OPTIONS.YEAR ||
      OPTIONS.YEARS
    ) {
      setReferenceDate(new Date());

      handleActiveTimeFormatChange(ACTIVITY_TIME_FORMAT_OPTIONS.MINUTES);
    }

    handleActiveCustomTimeInterval(period);
  }

  function handleActiveCustomTimeInterval(selected) {
    setActiveCustomTimeInterval(selected);
  }

  function handleActiveTimeFormatChange(selected) {
    setActiveTimeFormatOption(selected);
    api.logUserActivity(api.USER_DASHBOARD_TIME_COUNT_CHANGE, "", selected);
  }

  useEffect(() => {
    api.logUserActivity(api.USER_DASHBOARD_OPEN);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    api.getBookmarksCountsByDate((counts) => {
      var formatted = getMapData(counts);

      setAllWordsData(formatted);

      setAllWordsDataPerMonths(calculateCountPerMonth_Words(formatted));
    });

    api.getUserActivityByDay((activity) => {
      setDailyExerciseAndReadingTimes(activity);

      setMonthlyExerciseAndReadingTimes(
        calculateCountPerMonth_Activity(activity)
      );
    });
    // eslint-disable-next-line
  }, [activeTab]);

  if (!allWordsData || !dailyExerciseAndReadingTimes) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <UserDashboardTop
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
        activeTimeInterval={activeTimeInterval}
        handleActiveTimeIntervalChange={handleActiveTimeIntervalChange}
        handleActiveTimeFormatChange={handleActiveTimeFormatChange}
        activeTimeFormatOption={activeTimeFormatOption}
        referenceDate={referenceDate}
        handleChangeReferenceDate={handleChangeReferenceDate}
        calculateStreak={calculateStreak}
      />

      <s.NivoGraphContainer>
        {activeTab === TABS_IDS.BAR_GRAPH ? (
          <ReadingAndExercisesTimeGraph
            data={getBarGraphData(
              dailyExerciseAndReadingTimes,
              monthlyExerciseAndReadingTimes,
              activeCustomTimeInterval,
              referenceDate,
              activeTimeFormatOption
            )}
            activeCustomTimeInterval={activeCustomTimeInterval}
            activeTimeFormatOption={activeTimeFormatOption}
          />
        ) : activeTab === TABS_IDS.LINE_GRAPH ? (
          <TranslatedWordsGraph
            data={getLineGraphData(
              allWordsData,
              allWordsDataPerMonths,
              activeCustomTimeInterval,
              referenceDate
            )}
          />
        ) : (
          <></>
        )}
      </s.NivoGraphContainer>
    </>
  );
}
