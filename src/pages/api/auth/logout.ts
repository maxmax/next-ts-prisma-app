import { NextApiHandlerWithCookie } from 'src/types'
import authGuard from 'src/utils/authGuard'
import cookies from 'src/utils/cookie'

const logoutHandler: NextApiHandlerWithCookie = async (req, res) => {
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

export default authGuard(cookies(logoutHandler) as any)