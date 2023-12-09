import createCache from '@emotion/cache'

// Створюємо на клієнті тег `meta` з `name="emotion-insertion-point"` на початку <head>.
// Це дозволяє завантажувати стилі MUI у першочерговому порядку.
// Це також дозволяє розробникам легко перезаписувати стилі MUI, наприклад, за допомогою модулей CSS.

export default function createEmotionCache() {
  let insertionPoint

  if (typeof document !== 'undefined') {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    )
    insertionPoint = emotionInsertionPoint ?? undefined
  }

  return createCache({ key: 'mui-style', insertionPoint })
}