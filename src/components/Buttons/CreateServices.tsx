import { useUser } from 'src/utils/swr'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'
import CreateServicesForm from '../Forms/CreareServices'
import Modal from '../Modal'

export default function CreateServicesButton() {
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
          Create new service
        </Button>
      }
      modalContent={<CreateServicesForm />}
      size='M'
    />
  ) : (
    <Button variant='contained' sx={{ my: 2 }} onClick={onClick}>
      Create new service
    </Button>
  )
}