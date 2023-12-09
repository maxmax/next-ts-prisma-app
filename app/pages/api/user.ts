import prisma from '@/utils/prisma'
import jwt from 'jsonwebtoken'
import { NextApiHandler } from 'next'

const userHandler: NextApiHandler = async (req, res) => {
  // Витягуємо токен ідентифікації з куки
  const idToken = req.cookies[process.env.COOKIE_NAME]

  // якщо токен відсутній
  if (!idToken) {
    return res.status(401).json({ message: 'ID token must be provided' })
  }

  try {
    // декодуємо токен
    const decodedToken = (await jwt.verify(
      idToken,
      process.env.ID_TOKEN_SECRET
    )) as unknown as { userId: string }

    // якщо корисне навантаження відсутнє
    if (!decodedToken || !decodedToken.userId) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // Отримуємо дані користувача
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
			// Важливо!
			// не отримуємо пароль
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true
      }
    })

    // якщо дані відсутні
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // генеруємо токен доступу
    const accessToken = await jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d'
      }
    )

    // Повертаємо дані користувача та токен доступу
    res.status(200).json({ user, accessToken })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User get error' })
  }
}

export default userHandler