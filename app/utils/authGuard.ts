import jwt from 'jsonwebtoken'
import { AuthGuardMiddleware } from '../types'

const authGuard: AuthGuardMiddleware =
  (handler) => async (req, res) => {
		// retrieve the access token from the `Authorization` header
		// the value of this header should be the string `Bearer [accessToken]`
    const accessToken = req.headers.authorization?.split(' ')[1]

    // if there is no access token
    if (!accessToken) {
      return res.status(403).json({ message: 'Access token must be provided' })
    }

		// decode the token
		// token signature - `{ userId: string }`
    const decodedToken = (await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    )) as unknown as {
      userId: string
    }

    // if there is no payload
    if (
      !decodedToken || !decodedToken.userId
    ) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // write the user id to the request object
    req.userId = decodedToken.userId

    // pass control to the next handler
    return handler(req, res)
  }

export default authGuard