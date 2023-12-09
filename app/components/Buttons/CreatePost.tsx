import { useUser } from '@/utils/swr'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'
import CreatePostForm from '../Forms/CreatePost'
import Modal from '../Modal'

// за наявності даних користувача рендериться модалка з формою для створення посту
// за відсутності даних користувача рендерується повідомлення про необхідність авторизації
export default function CreatePostButton() {
  const { user } = useUser()

  const onClick = () => {
    toast('Authorization required', {
      type: 'warning'
    })
  }

  return user ? (
    <Modal
      triggerComponent={
        <Button variant='contained' sx={{ my: 2 }}>
          Create new post
        </Button>
      }
      modalContent={<CreatePostForm />}
      size='M'
    />
  ) : (
    <Button variant='contained' sx={{ my: 2 }} onClick={onClick}>
      Create new post
    </Button>
  )
}