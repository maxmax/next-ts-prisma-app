import type { User } from '@prisma/client'
import useSWRImmutable from 'swr/immutable'

async function fetcher<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> {
  return fetch(input, init).then((res) => res.json())
}

//Wash on otrimannya danikh koristuvach vikonuєtsya once
export function useUser() {
	// The utility turns over the customer data and access token, payment and
	// Cache invalidation function (method for mutating data stored in cache)
  const { data, error, mutate } = useSWRImmutable<any>(
    '/api/auth/user',
    (url) => fetcher(url, { credentials: 'include' }),
    {
      onErrorRetry(err, key, config, revalidate, revalidateOpts) {
        return false
      }
    }
  )

  // `error` - initial mercy (unaccountable blame)
  // `data.message` - information about custom mailing, for example:
  // res.status(404).json({ message: 'User not found' })
  if (error || data?.message) {
    console.log(error || data?.message)

    return {
      user: undefined,
      accessToken: undefined,
      mutate
    }
  }

  return {
    user: data?.user as User,
    accessToken: data?.accessToken as string,
    mutate
  }
}