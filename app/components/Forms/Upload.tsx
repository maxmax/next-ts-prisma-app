import { useUser } from '@/utils/swr'
import { Avatar, Box, Button, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function UploadForm({ closeModal }: Props) {
  // Посилання на елемент для превью завантаженого файлу
  const previewRef = useRef<HTMLImageElement | null>(null)
  // стан файлу
  const [file, setFile] = useState<File>()
  const { user, accessToken, mutate } = useUser()

  if (!user) return null

  // обробник відправлення форми
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!file) return

    e.preventDefault()

    const formData = new FormData()

    // створюємо екземпляр `File`, назвою якого є ID користувача + розширення файлу
    const _file = new File([file], `${user.id}.${file.type.split('/')[1]}`, {
      type: file.type
    })
    formData.append('avatar', _file)

    try {
      // надсилаємо файл на сервер
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Роут для завантаження аватара є захищеним
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!res.ok) {
        throw res
      }

      // Виймаємо оновлені дані користувача
      const user = await res.json()
      // Інвалідуємо кеш
      mutate({ user })

      // закриваємо модалку
      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Обробник зміни стану інпуту для завантаження файлу
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && previewRef.current) {
      // Виймаємо файл
      const _file = e.target.files[0]
      // оновлюємо стан
      setFile(_file)
      // Отримуємо посилання на елемент `img`
      const img = previewRef.current.children[0] as HTMLImageElement
      // формуємо та встановлюємо джерело зображення
      img.src = URL.createObjectURL(_file)
      img.onload = () => {
        // Очищаємо пам'ять
        URL.revokeObjectURL(img.src)
      }
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Avatar</Typography>
      <Box display='flex' alignItems='center' gap={2}>
        <input
          accept='image/*'
          style={{ display: 'none' }}
          id='avatar'
          name='avatar'
          type='file'
          onChange={handleChange}
        />
        <label htmlFor='avatar'>
          <Button component='span'>Choose file</Button>
        </label>
        <Avatar alt='preview' ref={previewRef} src='/img/user.png' />
        <Button
          type='submit'
          variant='contained'
          color='success'
          disabled={!file}
        >
          Upload
        </Button>
      </Box>
    </FormFieldsWrapper>
  )
}