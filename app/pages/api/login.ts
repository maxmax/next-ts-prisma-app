import { NextApiHandlerWithCookie } from '@/types'
import checkFields from '@/utils/checkFields'
import cookies from '@/utils/cookie'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

const loginHandler: NextApiHandlerWithCookie = async (req, res) => {
  const data: Pick<User, 'email' | 'password'> = JSON.parse(req.body)

  if (!checkFields(data, ['email', 'password'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    // Отримуємо дані користувача
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      },
			// Важливо!
			// тут нам потрібен пароль
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        avatarUrl: true
      }
    })

    // якщо дані відсутні
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // перевіряємо пароль
    const isPasswordCorrect = await argon2.verify(user.password, data.password)

    // якщо введено неправильний пароль
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: 'Wrong password' })
    }

    // генеруємо токен ідентифікації
    const idToken = await jwt.sign(
      { userId: user.id },
      process.env.ID_TOKEN_SECRET,
      {
        expiresIn: '7d'
      }
    )

    // генеруємо токен доступу
    const accessToken = await jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d'
      }
    )

    // записуємо токен ідентифікації в куки
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      options: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
        sameSite: true,
        secure: true
      }
    })
		
		// Повертаємо дані користувача (без пароля!)
		// і токен доступу
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      accessToken
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User login error' })
  }
}

export default cookies(loginHandler)