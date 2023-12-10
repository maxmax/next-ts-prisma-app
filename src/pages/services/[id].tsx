import EditServicesButton from 'src/components/Buttons/EditServices'
import RemoveServicesButton from 'src/components/Buttons/RemoveServices'
import CustomHead from 'src/components/CustomHead'
import prisma from 'src/utils/prisma'
import { useUser } from 'src/utils/swr'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@mui/material'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next'
import Link from 'next/link'

export default function ServicesPage({
  services
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useUser()
  const isServicesBelongsToUser = user && user.id === services.authorId

  return (
    <>
      <CustomHead title={services.title} description={services.content.slice(0, 10)} />
      <Box py={2}>
        <Card>
          <CardHeader
            avatar={<Avatar src={services.author.avatarUrl || '/img/user.png'} />}
            action={
              <Link href='/services'>
                <Button aria-label='return to about page'>
                  <ArrowBackIosNewIcon fontSize='small' />
                  <Typography variant='body2'>Back</Typography>
                </Button>
              </Link>
            }
            title={services.title}
            subheader={services.createdAt}
          />
          <CardMedia
            component='img'
            height='200'
            image='https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80'
            alt=''
          />
          <CardContent>
            <Typography variant='body1'>{services.content}</Typography>
          </CardContent>
          <CardActions>
            <Box display='flex' justifyContent='flex-end' gap={2} width='100%'>
              {isServicesBelongsToUser && (
                <>
                  <EditServicesButton services={services} icon={false} />
                  <RemoveServicesButton
                    servicesId={services.id}
                    authorId={services.authorId}
                    icon={false}
                  />
                </>
              )}
            </Box>
          </CardActions>
        </Card>
      </Box>
    </>
  )
}

export async function getServerSideProps({
  params
}: GetServerSidePropsContext<{ id: string }>) {
  try {
    const services = await prisma.services.findUnique({
      where: {
        id: params?.id
      },
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        content: true,
        latitude: true,
        longitude: true,
        author: true,
        authorId: true,
        createdAt: true
      }
    })
    if (!services) {
      return {
        notFound: true
      }
    }
    return {
      props: {
        services: {
          ...services,
          createdAt: new Date(services.createdAt).toLocaleDateString()
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}