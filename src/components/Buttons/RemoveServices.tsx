import { useUser } from 'src/utils/swr'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Button, IconButton } from '@mui/material'
import { useRouter } from 'next/router'

type Props = {
  servicesId: string
  authorId: string
  icon?: boolean
}

export default function RemoveServicesButton({
  servicesId,
	authorId,
  icon = true
}: Props) {
  const router = useRouter()
  const { user, accessToken } = useUser()

  if (!user || user.id !== authorId) return null

  const removeServices = async () => {
    try {
      await fetch(`/api/services?id=${servicesId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      router.push('/services')
    } catch (e: unknown) {
      console.error(e)
    }
  }

  return icon ? (
    <IconButton onClick={removeServices} color='error'>
      <DeleteOutlineIcon />
    </IconButton>
  ) : (
    <Button variant='contained' color='error' onClick={removeServices}>
      Remove
    </Button>
  )
}