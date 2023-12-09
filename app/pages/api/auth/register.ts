import { NextApiHandlerWithCookie } from '@/types'
import checkFields from '@/utils/checkFields'
import cookies from '@/utils/cookie'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

const registerHandler: NextApiHandlerWithCookie = async (req, res) => {
  // Витягуємо дані з тіла запиту
  // однією з переваг використання Prisma є автоматична генерація типів моделей
  const data: Pick<User, 'username' | 'email' | 'password'> = JSON.parse(
    req.body
  )

  // якщо немає хоча б одного обов'язкового поля
  if (!checkFields(data, ['email', 'password'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    // Отримуємо дані користувача
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // якщо дані є, значить, користувач уже зареєстрований
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // Хешуємо пароль
    const passwordHash = await argon2.hash(data.password)
    // і замінюємо їм оригінальний
    data.password = passwordHash

    // створюємо користувача - записуємо облікові дані користувача у БД
    const newUser = await prisma.user.create({
      data,
      // не "вибираємо" пароль це важливо
      select: {
        id: true,
        username: true,
        email: true
      }
    })

    // генеруємо токен ідентифікації на основі ID користувача
    const idToken = await jwt.sign(
      { userId: newUser.id },
      process.env.ID_TOKEN_SECRET,
      {
        // Термін життя токена, тобто. час, протягом якого токен буде вважатися валідним, становить 7 днів.
        expiresIn: '7d'
      }
    )

    // генеруємо токен доступу на основі ID користувача
    const accessToken = await jwt.sign(
      { userId: newUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // Важливо!
        //Такий термін життя токена доступу прийнятний тільки при розробці програми
        // див. нижче
        expiresIn: '1d'
      }
    )

    // записуємо токен ідентифікації в куки
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
			// важно!
			// настройки `httpOnly: true` и `secure: true` являются обязательными
      options: {
        httpOnly: true,
        // значення даної настройки має збігатися зі значенням настройки `expiresIn` токена
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // куки застосовується для всієї програми
        path: '/',
        // клієнт та сервер живуть за однією адресою
        sameSite: true,
        secure: true
      }
    })

    // Повертаємо дані користувача та токен доступу
    res.status(200).json({
      user: newUser,
      accessToken
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User register error' })
  }
}

export default cookies(registerHandler)