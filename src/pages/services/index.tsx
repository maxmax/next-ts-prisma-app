import Animate from 'src/components/AnimateIn'
import CreateServiceButton from 'src/components/Buttons/CreateServices'
import CustomHead from 'src/components/CustomHead'
import ServicesPreview from 'src/components/ServicesPreview'
import prisma from 'src/utils/prisma'
import { Divider, Grid, Typography } from '@mui/material'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next'

// dynamic page component
export default function Services({
  services
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  return (
    <>
      <CustomHead title='Services Page' description='This is Services Page' />
      <CreateServiceButton />
      <Divider />
      <Typography variant='h4' textAlign='center' py={2}>
        Services
      </Typography>
      {services?.length ? (
        <Grid container spacing={2} pb={2}>
          {services.map((service) => (
            <Grid item md={6} lg={4} key={service.id}>
              <Animate.FadeIn>
                <ServicesPreview services={service} />
              </Animate.FadeIn>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography mt={2}>There are no services yet</Typography>
      )}
    </>
  )
}

// server rendering function
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const services = await prisma.services.findMany({
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
    return {
      props: {
        services: services.map((service) => ({
          ...service,
          createdAt: new Date(service.createdAt).toLocaleDateString()
        }))
      }
    }
  } catch (e) {
    console.log(e)
    return {
      props: {
        services: []
      }
    }
  }
}