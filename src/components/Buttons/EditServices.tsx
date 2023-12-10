import { useUser } from 'src/utils/swr'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { Button, IconButton } from '@mui/material'
import type { Services } from '@prisma/client'
import EditServicesForm from '../Forms/EditServices'
import Modal from '../Modal'

type Props = {
  services: Omit<Services, 'createdAt' | 'updatedAt'> & {
    createdAt: string
  }
  icon?: boolean
}

export default function EditServicesButton({ services, icon = true }: Props) {
  const { user } = useUser()

  if (!user || user.id !== services.authorId) return null

  return (
    <Modal
      triggerComponent={
        icon ? (
          <IconButton color='info'>
            <DriveFileRenameOutlineIcon />
          </IconButton>
        ) : (
          <Button variant='contained' color='info'>
            Edit
          </Button>
        )
      }
      modalContent={<EditServicesForm services={services} />}
      size='M'
    />
  )
}