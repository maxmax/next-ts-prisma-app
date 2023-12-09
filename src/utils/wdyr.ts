import React from 'react'

// code runs only in development mode
// and only on the client
if (process.env.NODE_ENV === 'development' && typeof document !== 'undefined') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true
  })
}

export {}