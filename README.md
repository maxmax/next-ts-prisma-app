## Getting Started

~~~
npm run dev
npm run build
npm run start
npm run lint
~~~

## Base Started - step by step
*Для загального розуміння мого підходу*

**Main**

Створюємо новий Next.js-проект із підтримкою TS за допомогою Create Next App:

~~~
npm create next-app next-ts-prisma-app --ts
~~~

Встановлюємо мінімальний набір npm-пакетів, необхідних для роботи нашої програми:

#### виробничі залежності

~~~
npm install @emotion/cache @emotion/react @emotion/server @emotion/styled @formkit/auto-animate @mui/icons-material @mui/joy @mui/material @prisma/client @welldone-software/why-did-you-render argon2 cookie jsonwebtoken multer next-connect react-error-boundary react-toastify swiper swr
~~~

#### залежності для розробки

~~~
npm install -D @types/cookie @types/jsonwebtoken @types/multer babel-plugin-import prisma sass
~~~

+ @mui/... - компоненти та іконки Material UI;
+ @emotion/... - рішення CSS-в-JS, яке використовується для стилізації компонентів Material UI;
+ prisma - ORM для роботи з реляційними БД PostgreSQL, MySQL, SQLite та SQL Server, а також з NoSQL-БД MongoDB і CockroachDB;
+ @prisma/client - кліент Prisma;
+ @welldone-software/why-did-you-render - корисна утиліта для налагодження React-додатків, що дозволяє визначити причину повторного рендерингу компонента;
+ argon2 - утиліта для хешування та перевірки паролів;
+ cookie - утиліта для роботи з кукі;
+ jsonwebtoken - утиліта до роботи з токенами;
+ multer - посередник (middleware) Node.js для обробки multipart/form-data (для роботи з файлами, що містяться в запиті);
+ next-connect - бібліотека, що дозволяє працювати з інтерфейсом роутів Next.js як з роутами Express;
+ react-error-boundary - компонент-запобіжник для React-додатків;
+ react-toastify - компонент та утиліта для реалізації повідомлень у React-додатках;
+ swiper - просунутий компонент слайдера;
+ swr - хуки React для запиту (отримання - fetching) даних від сервера, що дозволяють обійтися без інструменту управління станом (state manager) але пізніше також додамо окремими гілками варіанти з Redux/Mobx;
+ @types/... - відсутні типи TS;
+ babel-plugin-import - плагін Babel для ефективної "трясіння дерева" (tree shaking) при імпорті компонентів MUI за назвою;
+ sass - препроцесор CSS.

### Підготовка БД та налаштування ORM

Для зберігання даних користувачів та постів нам потрібна БД. Для простоти будемо використовувати SQLite – у цій БД дані зберігаються у вигляді файлу на сервері. Для роботи з SQLite використовуватиметься Prisma. Пізніше ще підкинемо декілько БД, та запустимо все це у докері. Взагалі по БД буде ще окрема фіча та опис. 

*Раджу встановити це [розширення](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) для VSCode для роботи зі схемою Prisma*

#### Инициализируем Prisma, находясь в корневой директории проекта:

~~~
npx prisma init
~~~

Виконання цієї команди призводить до генерації директорії prisma і файлу .env. Редагуємо файл schema.prisma в директорії prisma, визначаючи провайдер для БД в блоці datasource і моделі користувача, поста та лайка. Тобто создаем модели в /schema.prisma.

Редагуємо файл .env, визначаючи в ньому шлях до файлу БД:

~~~
DATABASE_URL="file:./dev.db"
~~~

#### Створюємо та застосовуємо міграцію до БД:

~~~
npx prisma migrate dev --name init
~~~

Виконання цієї команди призводить до генерації директорії migrations з міграцією на SQL.

Зверніть увагу: при першому виконанні migrate dev автоматично встановлюється та генерується клієнт Prisma. Надалі за будь-якої зміни схеми Prisma необхідно вручну виконувати команду 

~~~ 
npx prisma generate 
~~~ 

для оновлення клієнта.

Також зверніть увагу, що для швидкого відновлення вихідного стану БД зі втратою всіх даних можна видалити файл dev.db і виконати команду 

~~~
npx prisma db push
~~~

Залишилося налаштувати клієнта Prisma. Створюємо файл src/utils/prisma.ts наступного змісту:

~~~
import { PrismaClient } from '@prisma/client'
declare let global: { prisma: PrismaClient }

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
~~~

Цей сніпет забезпечує існування тільки одного екземпляра (синглтона - singleton) клієнта Prisma при роботі як у виробничому середовищі, так і в середовищі для розробки. Справа в тому, що в режимі розробки через HMR при перезавантаженні модуля, що імпортує prisma, буде створюватися новий екземпляр клієнта.

### Підготовка та налаштування статичних даних для клієнта

**Preparing-and-configuring-static-data**

Наш додаток складатиметься з 3 сторінок: головної, блогу та контактів. На головній сторінці та сторінці контактів будуть використовуватися статичні дані у форматі JSON. При цьому дані для головної сторінки зберігатимуться локально, а дані для сторінки контактів - в JSONBin. Для головної сторінки реалізуємо статичну генерацію з даними за допомогою функції getStaticProps, а для сторінки контактів - статичну генерацію з даними з інкрементальною регенерацією за допомогою функцій getStaticProps і getStaticPaths. Ми ще поговоримо про це згодом.

**Создаем файл public/data/home.json с данными для главной страницы:**

*Зверніть увагу на джерела зображень (imgSrc). 2 зображення зберігаються локально в директорії public/img, а ще 2 запитуються з Unsplash. Для того, щоб мати можливість отримувати зображення з іншого джерела (origin) необхідно додати у файл next.config.js таке налаштування:*

~~~
images: {
  domains: ['images.unsplash.com']
}
~~~

Авторизуємося в JSONBin, переходимо в розділ "Bins", натискаємо "Create a Bin" та додаємо дані для сторінки контактів (новини - файл public/data/news.json):

Натискаємо на шестірню і вводимо як назву біну, а також натискаємо на замочок для того, щоб зробити бін доступним публічно:

Натискаємо "Save Bin" і копіюємо BIN ID в змінну JSONBIN_BIN_ID у файлі .env:

~~~
JSONBIN_BIN_ID=<ваш-bin-id>
~~~

Переходимо в розділ "API KEYS", натискаємо "Create Access Key", вводимо в якості назви ключа доступу і вибираємо "Read" в розділі "Bins":

Натискаємо "Save Access Key" та копіюємо значення полів "X-MASTER-KEY" та "X-ACCESS_KEY" у відповідні змінні:

~~~
JSONBIN_X_MASTER_KEY=<x-master-key>
JSONBIN_X_ACCESS_KEY=<x-access-key>
~~~

Створюємо файл environment.d.ts в корені проекту та визначаємо в ньому типи змінних середовища оточення:

~~~
declare namespace NodeJS {
  interface ProcessEnv {
    JSONBIN_BIN_ID: string
    JSONBIN_X_MASTER_KEY: string
    JSONBIN_X_ACCESS_KEY: string
    // про це трохи пізніше
    ID_TOKEN_SECRET: string
    ACCESS_TOKEN_SECRET: string
    COOKIE_NAME: string
  }
}
~~~

Підключаємо цей файл у tsconfig.json:

~~~
"include": [
  "next-env.d.ts",
  "environment.d.ts",
  "**/*.ts",
  "**/*.tsx",
],
~~~

*Надалі я не наводитиму приклади коду в документації, тільки за потребою або як посилання на файл у репозиторії для актуальної гілки.*

### Аутентифікація та авторизація

**Auth**

Для аутентифікації та авторизації користувачів нашої програми ми скористаємося сучасною та однією з 'найбезпечніших схем' – JSON Web Tokens + Cookie. На найвищому рівні це означає таке:

+ для зберігання стану аутентифікації сервер генерує токен ідентифікації (idToken) на основі даних користувача (наприклад, його ID) та записує його в куки зі спеціальними налаштуваннями;
+ на основі cookie із запиту користувача сервер визначає, чи зареєстрований користувач у додатку. Якщо користувач зареєстрований, сервер отримує ID користувача з токена ідентифікації, отримує дані користувача з БД і повертає їх клієнту;
+ для доступа к защищенным ресурсам сервер генерирует токен доступа (accessToken) и возвращает его авторизованному клиенту;
+ при доступе к защищенному ресурсу сервер проверяет наличие и валидность токена доступа из заголовка Authorization объекта запроса.

#### Посередники та утиліти авторизації

Реалізуємо 2 посередники та 1 утиліту авторизації:

+ cookie - посередник для роботи з кукі;
+ authGuard – посередник для надання доступу до захищених ресурсів;
+ checkFields – утиліта для перевірки наявності обов'язкових полів у тілі запиту.

**Почнемо з визначення змінних для cookie у файлі .env:**

~~~
ID_TOKEN_SECRET="id-token-secret"
ACCESS_TOKEN_SECRET="access-token-secret"
COOKIE_NAME="uid"
~~~

*Зверніть увагу: у реальному додатку секрети мають бути довгими довільно згенерованими рядками.*

+ Визначаємо типи для посередника cookie у файлі app/types.ts:

+ Визначаємо посередника для роботи з cookie у файлі utils/cookie.ts:
*Цей посередник дозволяє встановлювати cookie за допомогою res.cookie ({name, value, options}).*

Для застосування посередника достатньо обернути в нього обробник запитів:

~~~
import { NextApiHandlerWithCookie } from '@/types'
import cookies from '@/utils/cookie'

const handler: NextApiHandlerWithCookie = async (req, res) => {
  console.log(res.cookie)
  // ...
}

export default cookies(handler)
~~~

Визначаємо типи для посередника authGuard у файлі src/types.ts:

~~~
export type NextApiRequestWithUserId = NextApiRequest & {
  userId: string
}
  
export type NextApiHandlerWithUserId = (
	req: NextApiRequestWithUserId,
	res: NextApiResponse
) => unknown | Promise<unknown>
  
export type AuthGuardMiddleware = (
	handler: NextApiHandlerWithUserId
) => (req: NextApiRequestWithUserId, res: NextApiResponse) => void
~~~

**Визначаємо посередника для надання доступу до захищених ресурсів у файлі utils/authGuard.ts:**

**Нарешті визначаємо утиліту для перевірки наявності обов'язкових полів у тілі запиту у файлі utils/checkFields.ts:**

*Думаю, тут усе зрозуміло.*

#### Роути аутентифікації та авторизації

Інтерфейси роутів визначаються в директорії pages/api та доступні за адресою /api/*.

Створюємо в ній директорію auth з файлами register.ts та login.ts. 

**Та визначаємо роут для реєстрації register.ts.**

Ми генеруємо токен доступу з тривалим терміном життя. Це позбавляє нас необхідності його продовження (генерації нового токена) в посереднику authGuard, наприклад. Але це небезпечно, тому у виробничому додатку термін життя токена доступу має становити приблизно 1 годину. Також у реальному додатку має бути передбачений механізм автоматичного продовження токена ідентифікації: у нашому додатку користувач повинен виконувати вхід до системи один раз на тиждень.

**Визначаємо роут для авторизації: login.ts**

Створюємо файл auth/user.ts для роуту визначення стану аутентифікації та отримання даних користувача.

**Визначаємо роут для auth/logout.ts**
Нарешті, визначаємо роут для виходу користувача із системи у файлі auth/logout.ts

*Таким чином, ми реалізували 4 маршрути аутентифікації та авторизації:*

+ POST /api/register - для реєстрації користувача;
+ POST /api/login - для входу користувача в систему;
+ GET /api/user - для отримання даних зареєстрованого користувача;
+ GET /api/logout - для виходу користувача із системи.

#### Завантаження файлів

Користувачі нашого додатка отримають можливість завантажити аватари. Отже, нам необхідно реалізувати маршрут для збереження файлів на сервері. Для роботи з файлами із запиту зазвичай використовується Multer.

*Зверніть увагу: для реалізації всіх наступних роутів використовуватиметься next-connect.*

Створюємо в директорії api файл upload.ts
*Цей роут доступний за адресою /api/upload за допомогою POST.*

*Слід зазначити, що у нашій реалізації не вистачає логіки видалення старих аватарів користува: назва файлу складається з ID користувача і розширення файлу, тобто. один користувач може мати кілька файлів із різними розширеннями. Це стосується лише файлів на сервері, поле avatarUrl завжди міститиме посилання на останній завантажений файл. Також у реальному додатку має сенс визначити логіку для зменшення розміру файлу, що завантажується, наприклад, шляхом його стиснення.*

### CRUD-операції для постів та лайків
**CRUD-post-like**

Серверна частина нашої програми майже готова. Залишилося реалізувати роути для додавання, редагування та видалення постів, а також додавання та видалення лайків.

Зверніть увагу: всі наступні роути захищені.

Також зверніть увагу на те, що роути для отримання всіх постів та одного посту за ID будуть реалізовані на клієнті (серверної логіки на клієнті) за допомогою функції getServerSideProps.

**Створюємо в директорії api файл post.ts.**

У всіх випадках у відповідь на запит повертаються дані посту.

Таким чином, у нас є 3 роути для посту:

+ POST /api/post - для створення посту;
+ PUT /api/post - для оновлення посту;
+ DELETE /api/post?id=<post-id> - для видалення посту.

**Визначаємо роут для лайків у файлі api/like.ts**

Таким чином, у нас є 2 роути для лайка:

+ POST /api/like – для створення лайка;
+ DELETE /api/like?likeId=<like-id>&postId=<post-id> - для видалення лайка.

**Також визначаємо деякі заголовки HTTP, пов'язані з безпекою, у next.config.js для всіх роутів**

## Клієнт

*Налаштування проекту*

[Why Did You Render](https://github.com/welldone-software/why-did-you-render) – утиліта для налагодження React-додатків, що дозволяє визначити причину повторного рендерингу компонента. Для того, щоб мати можливість використовувати цю утиліту в Next.js-додатку, необхідно зробити 2 речі:

+ налаштувати пресет (preset) транспілятора Babel;
+ ініціалізувати утиліту та імпортувати її в основний компонент програми.

Налаштовуємо пресет Babel у файлі babel.config.js у корені проекту:

~~~
module.exports = function (api) {
  const isServer = api.caller((caller) => caller?.isServer)
  const isCallerDevelopment = api.caller((caller) => caller?.isDev)

  // пресети
  const presets = [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource:
            // код wdyr повинен виконуватися лише на клієнті
            // і лише у режимі розробки
            !isServer && isCallerDevelopment
              ? '@welldone-software/why-did-you-render'
              : 'react'
        }
      }
    ]
  ]

  return { presets }
}
~~~

**Ініціалізуємо WDYR у файлі utils/wdyr.ts:**

~~~
import React from 'react'

// код виконується лише у режимі розробки
// і лише на клієнті
if (process.env.NODE_ENV === 'development' && typeof document !== 'undefined') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true
  })
}

export {}
~~~

Імпортуємо WDYR у файлі _app.tsx:

~~~
import '@/utils/wdyr'
~~~

Після цього для налагодження у файлі компонента достатньо додати такий рядок:

~~~
SomeComponent.whyDidYouRender = true
~~~

##### Material UI

Material UI – найпопулярніша бібліотека компонентів React. Для її правильного використання в Next.js-додатку необхідно зробити 2 речі:

+ налаштувати плагін (plugin) Babel;
+ налаштувати кеш Emotion - рішення CSS-в-JS, яке використовується MUI для стилізації компонентів.

Та налаштовуємо плагін Babel у файлі babel.config.js

~~~
module.exports = function (api) {
  // Пресети
  // ...

  // плагіни
  const plugins = [
    [
      'babel-plugin-import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false
      },
      'core'
    ]
  ]

  return { presets, plugins }
}
~~~

Навіщо потрібен цей плагін? Для зменшення розміру клієнтського складання. Проблема в тому, що під час імпорту компонента MUI за назвою, наприклад:

~~~
import { Button } from '@mui/material'
~~~

У складання потрапить весь пакет @mui/material, тобто. всі компоненти MUI незалежно від того, використовуються вони у додатку чи ні. babel-plugin-import перетворює іменований імпорт на дефолтний, тобто. на виході ми отримуємо, наприклад:

~~~
import Button from '@mui/material/Button'
~~~

Таким чином, у складання потрапляють лише компоненти, що використовуються у додатку.

Налаштування кешу Emotion необхідне для запобігання спалаху нестилізованого контенту (flash of unstyled content), наприклад, коли спочатку завантажуються дефолтні стилі браузера і тільки потім стилі MUI, а також забезпечення можливості легкої перезапису стилів MUI, тобто. кастомізації компонентів

**Визначаємо утиліту для створення кешу Emotion у файлі**

+ utils/createEmotionCache.ts

~~~
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
~~~

Кеш необхідно створювати під час запуску програми як на сервері, так і на клієнті. 

+ Налаштовуємо рендеринг документа у файлі _document.tsx (створення кешу на сервері):
+ Налаштовуємо рендеринг компонентів у файлі _app.tsx (створення кешу на клієнті):

#### Формування структури компонентів

У нашому додатку використовуватиметься декілька "глобальних" компонентів:

+ компонент повідомлень (react-toastify);
+ компонент слайдера (swiper);
+ запобіжник (react-error-boundary).

У нас буде загальний макет (layout) для всіх сторінок програми. Ми сформуємо його прямо у _app.tsx.

Крім того, ми будемо анімувати перехід між сторінками за допомогою @formkit/auto-animate (цю утиліту можна розглядати як сучасну альтернативу React Transition Group).

Імпортуємо компоненти та стилі, та формуємо структуру компонентів в _app.tsx

+ Додаємо компонент для додавання метаданих до розділу head документа (components/head.tsx)
+ Резервний компонент (components/ErrorFallback.tsx)
+ Підвал сайту (components/Footer.tsx)
+ Шапка сайтy (components/Header.tsx)
+ Десктопне меню (components/Menu/Desktop.tsx): *Даний компонент є список посилань і кнопку профілю.*
+ Мобільне меню (components/Menu/Mobile.tsx)

#### Генерація статичного контенту

Генерація статичного контенту (або статичної сторінки) (static-site generation, SSG) - це процес, в результаті якого сервер генерує готову до використання розмітку (HTML) на етапі складання програми. Готовність до використання означає, що, по-перше, клієнт миттєво отримує сторінку у відповідь запит, по-друге, такі сторінки добре індексуються пошуковими ботами (SEO).

Статичний контент буває 2 видів: з даними та без. Статика без даних – це просто розмітка. Статика з даними - це розмітка, для генерації якої використовуються дані, доступні на етапі збирання (дані можуть зберігатися як локально, так і віддалено). Ще раз: сторінка генерується на основі даних, актуальних на момент збирання. За загальним правилом, це неможливе оновлення сторінки свіжими даними без створення нового складання. Next.js дозволяє обійти це обмеження за допомогою генерації статичного контенту з інкрементальною (частковою) регенерацією.

У нашому додатку статичними є головна сторінка та сторінка контактів. Для генерації обох сторінок використовуються дані. Дані для головної сторінки зберігаються локально. Передбачається, що вони оновлюються між збираннями. Дані для сторінки контактів зберігаються віддалено (на JSONBin.io). Передбачається, що вони оновлюються кожні 12 годин. Для оновлення сторінки контактів кожні 12 годин запускається процес інкрементальної регенерації.

#### Головна сторінка

Головна сторінка (pages/index.tsx) складається зі слайдера та 4 інформаційних блоків та генерується за допомогою даних, що знаходяться у файлі public/data/home.json. Для передачі даних компоненту сторінки використовується функція getStaticProps, а для читання даних модуль Node.js fs (https://nodejs.org/api/fs.html)

+ Главная страница (pages/index.tsx)

#### Сторінка контактів

Сторінка контактів (pages/about.tsx) складається з привітального блоку і 6 блоків новин і генерується на основі даних, що зберігаються на JSONBin.io. Для отримання даних використовується fetch. Кожна новина має власну сторінку (pages/news/[id].tsx). Для передачі даних компоненту сторінки контактів використовується функція getStaticProps. А для передачі даних сторінці новини - функції getStaticProps та getStaticPaths. getStaticPaths повідомляє Next.js про те, скільки у нас новин, тобто. скільки сторінок новин необхідно згенерувати на етапі складання програми.

+ Почнемо зі сторінки контактів (pages/about.tsx)

Завдяки налаштуванню revalidate сторінка генерується на етапі складання та оновлюється кожні 12 годин. Це означає таке:

- Відповідь на будь-який запит до сторінки контактів до 12 годин миттєво повертається (доставляється) з кешу;
- через 12 годин наступний запит також отримує у відповідь кешовану версію сторінки;
- після цього у фоновому режимі запускається процес регенерації сторінки (викликається getStaticProps() та формується нова розмітка);
- після успішної регенерації кеш інвалідується та відображається нова сторінка. При провалі регенерації стара сторінка залишається незмінною.

**Сторінка новини (pages/news/[id].tsx):**


#### Аутентифікація, авторизація та завантаження файлів

Під час запуску програма запитує у сервера дані користувача. Це єдині дані, за зміною яких "спостерігає" додаток. Запит даних користувача реалізовано за допомогою SWR. SWR дозволяє кешувати дані та мутувати їх за потреби, наприклад, після реєстрації користувача. Завдяки SWR ми можемо обійтися без інструменту управління станом програми (state manager).

- Визначаємо абстракцію над SWR для отримання даних користувача у файлі utils/swr.ts:

#### Аутентификация и авторизация

- У шапці сайті є кнопка профілю (Buttons/Profile.tsx)

- Функціонал реєстрації, авторизації, завантаження аватарів та виходу із системи інкапсульований у модальному вікні (components/Modal.tsx):

- За відсутності даних користувача вмістом модалки є вкладки аутентифікації (components/AuthTabs.tsx):

- Форма реєстрації (components/Forms/Register.tsx):

#### Панель користувача

За наявності даних користувача вмістом модалки, яка рендерується при натисканні кнопки профілю, є панель користувача (components/UserPanel.tsx), що містить форму для завантаження аватара і кнопку для виходу користувача з системи:

- Форма завантаження аватара (components/Forms/Upload.tsx):
- Кнопка для виходу із системи (components/Buttons/Logout.tsx):
*Після завантаження аватар користувача відображається у шапці сайті на місці кнопки профілю.*

#### Створення, оновлення, видалення та лайк постів

Для створення сторінки блогу та сторінок постів використовується рендеринг на стороні сервера за допомогою функції getServerSideProps. Ця функція дозволяє виконувати серверний код і викликатиметься при кожному запиті сторінки.

На сторінці блогу (pages/posts/index.tsx) рендерується кнопка для створення нового посту та список постів (за наявності):

- Кнопка створення посту (components/Button/CreatePost.tsx)
- Форма створення посту (components/Forms/CreatePost.tsx)
- Сторінка посту (pages/posts/[id].tsx)
- Клавіша лайка посту (components/Buttons/LikePost.tsx)
- Кнопка видалення поста (components/Buttons/RemovePost.tsx)
- Кнопка редагування поста (components/Buttons/EditPost.tsx)
*При натисканні цієї кнопки мода рендерується з формою для редагування посту (components/Forms/EditPost.tsx), яка майже ідентична формі створення посту.*

*Клавіші лайка, редагування та видалення поста дублюються на сторінці блогу в картках прев'ю постів у вигляді іконок.*

-------------------------------------------------------

### Послуги, оновлення, видалення

- Geo point - openstreetmap