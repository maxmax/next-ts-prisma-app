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

-- @mui/... - компоненти та іконки Material UI;
-- @emotion/... - рішення CSS-в-JS, яке використовується для стилізації компонентів Material UI;
-- prisma - ORM для роботи з реляційними БД PostgreSQL, MySQL, SQLite та SQL Server, а також з NoSQL-БД MongoDB і CockroachDB;
-- @prisma/client - кліент Prisma;
-- @welldone-software/why-did-you-render - корисна утиліта для налагодження React-додатків, що дозволяє визначити причину повторного рендерингу компонента;
-- argon2 - утиліта для хешування та перевірки паролів;
-- cookie - утиліта для роботи з кукі;
-- jsonwebtoken - утиліта до роботи з токенами;
-- multer - посередник (middleware) Node.js для обробки multipart/form-data (для роботи з файлами, що містяться в запиті);
-- next-connect - бібліотека, що дозволяє працювати з інтерфейсом роутів Next.js як з роутами Express;
-- react-error-boundary - компонент-запобіжник для React-додатків;
-- react-toastify - компонент та утиліта для реалізації повідомлень у React-додатках;
-- swiper - просунутий компонент слайдера;
-- swr - хуки React для запиту (отримання - fetching) даних від сервера, що дозволяють обійтися без інструменту управління станом (state manager) але пізніше також додамо окремими гілками варіанти з Redux/Mobx;
-- @types/... - відсутні типи TS;
-- babel-plugin-import - плагін Babel для ефективної "трясіння дерева" (tree shaking) при імпорті компонентів MUI за назвою;
-- sass - препроцесор CSS.

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
~~~ npx prisma generate ~~~ 
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

*Обратите внимание на источники изображений (imgSrc). 2 изображения хранятся локально в директории public/img, а еще 2 запрашиваются с Unsplash. Для того, чтобы иметь возможность получать изображения из другого источника (origin) необходимо добавить в файл next.config.js такую настройку:*

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

...


