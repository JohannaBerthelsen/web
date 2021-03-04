import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import * as s from './ArticleReader.sc'
import { Link } from 'react-router-dom'

import { TranslatableText } from './TranslatableText'

import InteractiveText from './InteractiveText'
import BookmarkButton from './BookmarkButton'

import LoadingAnimation from '../components/LoadingAnimation'
import { setTitle } from '../assorted/setTitle'

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery () {
  return new URLSearchParams(useLocation().search)
}

export default function ArticleReader ({ api }) {
  let query = useQuery()

  const articleID = query.get('id')

  const [articleInfo, setArticleInfo] = useState()
  const [interactiveText, setInteractiveText] = useState()
  const [interactiveTitle, setInteractiveTitle] = useState()

  const [translating, setTranslating] = useState(true)
  const [pronouncing, setPronouncing] = useState(false)

  useEffect(() => {
    api.getArticleInfo(articleID, data => {
      setInteractiveText(new InteractiveText(data.content, data, api))
      setInteractiveTitle(new InteractiveText(data.title, data, api))
      setArticleInfo(data)
      setTitle(data.title)

      api.setArticleOpened(data.id)
    })

    // eslint-disable-next-line
  }, [])

  function toggle (state, togglerFunction) {
    togglerFunction(!state)
  }

  function toggleBookmarkedState () {
    let newArticleInfo = { ...articleInfo, starred: !articleInfo.starred }
    api.setArticleInfo(newArticleInfo, () => {
      setArticleInfo(newArticleInfo)
    })
  }

  function setLikedState (state) {
    let newArticleInfo = { ...articleInfo, liked: state }
    api.setArticleInfo(newArticleInfo, () => {
      setArticleInfo(newArticleInfo)
    })
  }

  if (!articleInfo) {
    return <LoadingAnimation />
  }

  return (
    <s.ArticleReader>
      <s.Toolbar>
        <div className='lala'>
          <button
            className={translating ? 'selected' : ''}
            onClick={e => toggle(translating, setTranslating)}
          >
            <img src='/static/images/translate.svg' alt='translate on click' />
            <span className='tooltiptext'>translate on click</span>
          </button>
          <button
            className={pronouncing ? 'selected' : ''}
            onClick={e => toggle(pronouncing, setPronouncing)}
          >
            <img src='/static/images/sound.svg' alt='listen on click' />
            <span className='tooltiptext'>listen on click</span>
          </button>
        </div>
      </s.Toolbar>
      <s.Title>
        <TranslatableText
          interactiveText={interactiveTitle}
          translating={translating}
          pronouncing={pronouncing}
        />
      </s.Title>
      <s.BookmarkButton>
        <BookmarkButton
          bookmarked={articleInfo.starred}
          toggleBookmarkedState={toggleBookmarkedState}
        />
      </s.BookmarkButton>
      <br />
      <div>{articleInfo.authors}</div>
      <a href={articleInfo.url} target='_blank' rel='noreferrer' id='source'>
        source
      </a>
      <hr />
      <s.MainText>
        <TranslatableText
          interactiveText={interactiveText}
          translating={translating}
          pronouncing={pronouncing}
        />
      </s.MainText>

      <s.FeedbackBox>
        <small>
          Help us make Zeeguu even smarter by always letting us know whether you
          liked reading an article or not.
        </small>

        <h4>Did you enjoy the article?</h4>

        <s.CenteredContent>
          <s.WhiteButton
            onClick={e => setLikedState(true)}
            className={articleInfo.liked === true && 'selected'}
          >
            Yes
          </s.WhiteButton>
          <s.WhiteButton
            onClick={e => setLikedState(false)}
            className={articleInfo.liked === false && 'selected'}
          >
            No
          </s.WhiteButton>
        </s.CenteredContent>
      </s.FeedbackBox>

      <s.FeedbackBox>
        <h2>Review Vocabulary</h2>
        <small>
          Review your translations now to ensure better learning and ensure that
          you tell Zeeguu which of the words you want prioritize in your study.
        </small>
        <br />
        <br />
        <s.CenteredContent>
          <Link to={`/words/forArticle/${articleID}`}>
            <s.OrangeButton>Review Vocabulary</s.OrangeButton>
          </Link>
        </s.CenteredContent>
      </s.FeedbackBox>
      <s.ExtraSpaceAtTheBottom />
    </s.ArticleReader>
  )
}