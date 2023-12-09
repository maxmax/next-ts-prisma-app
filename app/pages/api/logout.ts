import { NextApiHandlerWithCookie } from '@/types'
import authGuard from '@/utils/authGuard'
import cookies from '@/utils/cookie'

const logoutHandler: NextApiHandlerWithCookie = async (req, res) => {
  // для реалізації виходу користувача із системи достатньо видалити куки
  res.cookie({
    name: process.env.COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: true,
      secure: true
    }
  })

  res.status(200).json({ message: 'Logout success' })
}

// Зверніть увагу, що цей роут є захищеним
export default authGuard(cookies(logoutHandler) as any)