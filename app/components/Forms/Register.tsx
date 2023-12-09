import type { UserResponseData } from '@/types'
import storageLocal from '@/utils/storageLocal'
import { useUser } from '@/utils/swr'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { User } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function RegisterForm({ closeModal }: Props) {
  const theme = useTheme()
  const router = useRouter()
  //Метод для мутування даних користувача
  const { mutate } = useUser()

  // состояние ошибок
  const [errors, setErrors] = useState<{
    email?: boolean
    password?: boolean
    passwordConfirm?: boolean
  }>({})

  // обробник відправлення форми
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    // дані користувача як об'єкт
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<User, 'username' | 'email' | 'password'> & {
      passwordConfirm?: string
    }

    // валідація форми
    const _errors: typeof errors = {}
    if (formData.password.length < 6) {
      _errors.password = true
    }
    if (formData.password !== formData.passwordConfirm) {
      _errors.passwordConfirm = true
    }
    // якщо є помилки
    if (Object.keys(_errors).length) {
      return setErrors({ ..._errors })
    }

    // видаляємо зайві дані
    delete formData.passwordConfirm

    try {
      // надсилаємо дані на сервер
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

			// якщо відповідь має статус код 409,
			// отже, користувач уже зареєстровано
      if (res.status === 409) {
        return setErrors({ email: true })
      } else if (!res.ok) {
        throw res
      }

      // Витягуємо дані користувача та токен доступу з відповіді
      const data = await res.json() as UserResponseData
      // Інвалідуємо кеш
      mutate(data)
      // фіксуємо факт реєстрації користувача у локальному сховищі
      storageLocal.set('user_has_been_registered', true)

      // закриваємо модалку
      if (closeModal) {
        closeModal()
      }

      // Перенаправлення користувача на головну сторінку
      if (router.pathname !== '/') {
        router.push('/')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // обробник введення
  const handleInput: React.FormEventHandler<HTMLFormElement> = () => {
    // скидаємо помилки за наявності
    if (Object.keys(errors).length) {
      setErrors({})
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit} handleInput={handleInput}>
      <Typography variant='h4'>Register</Typography>
      <FormControl required>
        <InputLabel htmlFor='username'>Username</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='username'
          name='username'
          startAdornment={<PersonOutlineIcon />}
        />
      </FormControl>
      <FormControl required error={errors.email}>
        <InputLabel htmlFor='email'>Email</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='email'
          type='email'
          name='email'
          startAdornment={<MailOutlineIcon />}
        />
        {errors.email && <FormHelperText>Email already in use</FormHelperText>}
      </FormControl>
      <FormControl required error={errors.password}>
        <InputLabel htmlFor='password'>Password</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='password'
          type='password'
          name='password'
          startAdornment={<VpnKeyIcon />}
        />
        <FormHelperText>
          Password must be at least 6 characters long
        </FormHelperText>
      </FormControl>
      <FormControl required error={errors.passwordConfirm}>
        <InputLabel htmlFor='password-confirm'>Confirm password</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='password-confirm'
          type='password'
          name='passwordConfirm'
          startAdornment={<VpnKeyIcon />}
        />
        {errors?.passwordConfirm && (
          <FormHelperText>Passwords must be the same</FormHelperText>
        )}
      </FormControl>
      <Button type='submit' variant='contained' color='success'>
        Register
      </Button>
    </FormFieldsWrapper>
  )
}