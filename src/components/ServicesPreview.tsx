import { useUser } from 'src/utils/swr'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material'
import type { Services } from '@prisma/client'
import Link from 'next/link'
import EditServicesButton from './Buttons/EditServices'
import RemoveServicesButton from './Buttons/RemoveServices'

type Props = {
  services: Omit<Services, 'createdAt' | 'updatedAt'> & {
    createdAt: string
  }
}

export default function ServicesPreview({ services }: Props) {
  const { user } = useUser()
  const isPostBelongsToUser = user?.id === services.authorId

  return (
    <Card>
      <CardHeader title={services.title} subheader={services.createdAt} />
      <CardContent>
				<Typography sx={{ mb: 1.5 }} color="text.secondary">
					{services.type} - {services.price}
				</Typography>
        <Typography variant='body2' color='text.secondary'>
          {services.content}
        </Typography>
      </CardContent>
      <CardActions>
        <Box display='flex' justifyContent='space-between' width='100%'>
          <Link href={`services/${services.id}`}>
            <Button>
              <Typography variant='body2'>More</Typography>
              <ArrowForwardIosIcon fontSize='small' />
            </Button>
          </Link>
          <Box display='flex' gap={1}>
            {isPostBelongsToUser && (
              <>
                <EditServicesButton services={services} />
                <RemoveServicesButton servicesId={services.id} authorId={services.authorId} />
              </>
            )}
          </Box>
        </Box>
      </CardActions>
    </Card>
  )
}