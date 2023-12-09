import type { User } from '@prisma/client'
import useSWRImmutable from 'swr/immutable'

async function fetcher<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> {
  return fetch(input, init).then((res) => res.json())
}

// Запит на отримання даних користувача виконується один раз
export function useUser() {
	// Утиліта повертає дані користувача та токен доступу, помилку та
	// Функцію інвалідності кешу (метод для мутування даних, що зберігаються в кеші)
  const { data, error, mutate } = useSWRImmutable<any>(
    '/api/auth/user',
    (url) => fetcher(url, { credentials: 'include' }),
    {
      onErrorRetry(err, key, config, revalidate, revalidateOpts) {
        return false
      }
    }
  )

	// `error` - звичайна помилка (необроблений виняток)
	// `data.message` - повідомлення про кастомну помилку, наприклад:
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