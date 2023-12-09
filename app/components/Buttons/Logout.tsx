import { useUser } from '@/utils/swr'
import { Box, Button } from '@mui/material'

type Props = {
  closeModal?: () => void
}

export default function LogoutButton({ closeModal }: Props) {
  const { accessToken, mutate } = useUser()

  // Обробник натискання кнопки
  const onClick = async () => {
    try {
      // повідомляємо сервер про вихід користувача з системи
      const response = await fetch('/api/auth/logout', {
        headers: {
          // Роут є захищеним
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw response
      }

      // Інвалідуємо кеш
      mutate({ user: undefined, accessToken: undefined })

      // закриваємо модалку
      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Box display='flex' justifyContent='flex-end' pt={2} pr={2}>
      <Button color='error' variant='contained' onClick={onClick}>
        Logout
      </Button>
    </Box>
  )
}