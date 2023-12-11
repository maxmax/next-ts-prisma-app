import createEmotionCache from 'src/utils/createEmotionCache'
import createEmotionServer from '@emotion/server/create-instance'
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document'

export default function MyDocument(props: any) {
  return (
    <Html lang='en'>
      <Head>
        <link rel='icon' href='data:.' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=swap'
          rel='stylesheet'
        />
        <meta name='emotion-insertion-point' content='' />
        {props.emotionStyleTags}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` належить `_document` (а не `_app`),
// це сумісне з генерацією статичного контенту (SSG).
MyDocument.getInitialProps = async (docContext: DocumentContext) => {
  // Порядок дозволу
  //
  // На сервері:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // На сервері у разі помилки:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // На клієнті:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = docContext.renderPage

  // Кеш Emotion можна розподіляти між усіма запитами SSR підвищення продуктивності.
  // Однак це може мати глобальні побічні ефекти.
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  docContext.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />
        }
    })

  const docProps = await Document.getInitialProps(docContext)
  // Важливо. Це не дозволяє Emotion рендерувати невалідний HTML.
  // Див. https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(docProps.html)
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  return {
    ...docProps,
    emotionStyleTags
  }
}