import { CookieSerializeOptions } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'

// parameters accepted by the function
export type CookieArgs = {
  name: string
  value: any
  options?: CookieSerializeOptions
}

// extend the response object
export type NextApiResponseWithCookie = NextApiResponse & {
  cookie: (args: CookieArgs) => void
}

// extend the request handler
export type NextApiHandlerWithCookie = (
  req: NextApiRequest,
  res: NextApiResponseWithCookie
) => unknown | Promise<unknown>

// determine the type of intermediary
export type CookiesMiddleware = (
  handler: NextApiHandlerWithCookie
) => (req: NextApiRequest, res: NextApiResponseWithCookie) => void

// Defining types for the authGuard broker
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