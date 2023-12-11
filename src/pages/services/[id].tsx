import * as React from "react";
import EditServicesButton from 'src/components/Buttons/EditServices'
import RemoveServicesButton from 'src/components/Buttons/RemoveServices'
import CustomHead from 'src/components/CustomHead'
// import GeoPoint from 'src/components/GeoPoint'
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
import dynamic from 'next/dynamic';

export default function ServicesPage({
  services
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useUser()
  const isServicesBelongsToUser = user && user.id === services.authorId

  const GeoPoint = React.useMemo(() => dynamic(
    () => import('@/components/GeoPoint'),
    { 
      loading: () => <p>A map is loading</p>,
      ssr: false
    }
  ), []) 

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
          <GeoPoint
            position={[services.latitude, services.longitude]}
            zoom={12}
          />
          <CardContent>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {services.type} - {services.price}
            </Typography>
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