import { useUser } from '@/utils/swr'
import { Avatar, ListItemButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AuthTabs from '../AuthTabs'
import Modal from '../Modal'
import UserPanel from '../UserPanel'

export default function ProfileButton() {
  // запитуємо дані користувача
  const { user } = useUser()
  const theme = useTheme()

  //Вміст модального вікна залежить від наявності даних користувача
  const modalContent = user ? <UserPanel /> : <AuthTabs />

  return (
    <Modal
      // компонент, взаємодія з яким призводить до відкриття модального вікна
      triggerComponent={
        <ListItemButton sx={{ borderRadius: '50%', px: theme.spacing(1) }}>
          <Avatar
            // Джерелом аватара є або файл, завантажений користувачів, або дефолтне зображення
            src={user && user.avatarUrl ? user.avatarUrl : '/img/user.png'}
          />
        </ListItemButton>
      }
      modalContent={modalContent}
    />
  )
}