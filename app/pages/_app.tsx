import '@/utils/wdyr'
import '@/global.scss'
import createEmotionCache from '@/utils/createEmotionCache'
import { CacheProvider, EmotionCache } from '@emotion/react'
// скидання CSS
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import type { AppProps } from 'next/app'

import ErrorFallback from '@/components/ErrorFallback'
import Footer from '@/components/Footer'
import CustomHead from '@/components/Head'
import Header from '@/components/Header'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ErrorBoundary } from 'react-error-boundary'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif'
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          width: 'unset'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          flexGrow: 'unset'
        }
      }
    }
  }
})

// створюємо клієнтський кеш
const clientSideEmotionCache = createEmotionCache()

export default function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache?: EmotionCache }) {
  // посилання на анімований елемент
  const [animationParent] = useAutoAnimate()

  return (
    <>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* компонент для додавання метаданих в `head` */}
          <CustomHead
            title='Default Title'
            description='This is default description'
          />
          {/* запобіжник */}
          <ErrorBoundary
            // резервний компонент
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
          >
            <Container
              maxWidth='xl'
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Header />
              <Box component='main' flexGrow={1} ref={animationParent}>
                {/* компонент сторінки */}
                <Component {...pageProps} />
              </Box>
              <Footer />
            </Container>
            {/* компонент повідомлень */}
            <ToastContainer autoClose={2000} hideProgressBar theme='colored' />
          </ErrorBoundary>
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}