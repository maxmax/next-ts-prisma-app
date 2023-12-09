import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import prisma from '@/utils/prisma'
import multer from 'multer'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

// створюємо обробник файлів
const upload = multer({
  storage: multer.diskStorage({
    // Визначити директорію для зберігання аватарів користувачів
    destination: './public/avatars',
		// Важливо!
		// Назвою файлу є ідентифікатор користувача + розширення вихідного файлу
		// це буде реалізовано на клієнті
    filename: (req, file, cb) => cb(null, file.originalname)
  })
})

// створюємо роут
const uploadHandler = nextConnect<
  NextApiRequestWithUserId & { file?: Express.Multer.File },
  NextApiResponse
>()

// додаємо посередника
// Важливо!
// Поле для завантаження файлу на клієнті має називатися `avatar`
// <input type="file" name="avatar" />
uploadHandler.use(upload.single('avatar'))

// обробляємо POST-запит
uploadHandler.post(async (req, res) => {
	// multer зберігає файл у директорії `public/avatars`
	// і записує дані файлу в об'єкт `req.file`
  if (!req.file) {
    return res.status(500).json({ message: 'File write error' })
  }

  try {
    // оновлюємо дані користувача
    const user = await prisma.user.update({
			// Ідентифікатор користувача зберігається в об'єкті запиту
			// після обробки запиту посередником `authGuard`
      where: { id: req.userId },
      data: {
        // видаляємо `public`
        avatarUrl: req.file.path.replace('public', '')
      },
			// Важливо!
			// не отримуємо пароль
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        email: true
      }
    })

    // Повертаємо дані користувача
    res.status(200).json(user)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'User update error' })
  }
})

// Роут є захищеним
export default authGuard(uploadHandler)

// Важливо!
// відключаємо перетворення тіла запиту на JSON
export const config = {
  api: {
    bodyParser: false
  }
}