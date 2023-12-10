import { useUser } from 'src/utils/swr'
import { CssVarsProvider } from '@mui/joy/styles'
import Textarea from '@mui/joy/Textarea'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography,
  Grid
} from '@mui/material'
import { red } from '@mui/material/colors'
import { useTheme } from '@mui/material/styles'
import type { Services } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'
import services from '@/pages/api/services'

type Props = {
  closeModal?: () => void
}

export default function CreateServicesForm({ closeModal }: Props) {
    const theme = useTheme()
    const { user, accessToken } = useUser()
    const router = useRouter()
  
    const [errors, setErrors] = useState<{
      content?: number
    }>({})
  
    if (!user) return null
  
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
      if (!user) return
      e.preventDefault()
      const formData = Object.fromEntries(
        new FormData(e.target as HTMLFormElement)
      ) as unknown as Pick<Services, 'title' | 'type' | 'price' | 'content' | 'latitude' | 'longitude'>
  
      if (formData.content.length < 50) {
        return setErrors({ content: formData.content.length })
      }
  
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
  
        if (!response.ok) {
          throw response
        }
  
        const services = await response.json()
  
        router.push(`/services/${services.id}`)
  
        if (closeModal) {
          closeModal()
        }
      } catch (e) {
        console.error(e)
      }
    }
  
    const onInput = () => {
      if (Object.keys(errors).length) {
        setErrors({ content: undefined })
      }
    }
  
    return (
      <FormFieldsWrapper handleSubmit={handleSubmit}>
        <Typography variant='h4'>Create Service</Typography>
        <FormControl required>
          <InputLabel htmlFor='title'>Title</InputLabel>
          <Input
            sx={{ gap: theme.spacing(1) }}
            id='title'
            type='text'
            name='title'
            inputProps={{
              minLength: 3
            }}
          />
        </FormControl>
        <Grid container spacing={2}>
					<Grid item xs={6}>
						<FormControl required>
							<InputLabel htmlFor='price'>Type</InputLabel>
							<Input
							sx={{ gap: theme.spacing(1) }}
							id='type'
							type='text'
							name='type'
							inputProps={{
								minLength: 3
							}}
							/>
						</FormControl>
					</Grid>
					<Grid item xs={6}>
						<FormControl required>
							<InputLabel htmlFor='price'>Price</InputLabel>
							<Input
							sx={{ gap: theme.spacing(1) }}
							id='price'
							type='text'
							name='price'
							inputProps={{
							minLength: 3
							}}
							/>
						</FormControl>
					</Grid>
        </Grid>
        <Grid container spacing={2}>
					<Grid item xs={6}>
						<FormControl required>
							<InputLabel htmlFor='latitude'>Latitude</InputLabel>
							<Input
							sx={{ gap: theme.spacing(1) }}
							id='latitude'
							type='text'
							name='latitude'
							inputProps={{
							minLength: 3
							}}
							/>
						</FormControl>
					</Grid>
					<Grid item xs={6}>
						<FormControl required>
							<InputLabel htmlFor='longitude'>Longitude</InputLabel>
							<Input
							sx={{ gap: theme.spacing(1) }}
							id='longitude'
							type='text'
							name='longitude'
							inputProps={{
								minLength: 3
							}}
							/>
						</FormControl>						
					</Grid>
				</Grid>
        <Box>
          <InputLabel>
            Content * <Typography variant='body2'>(50 symbols min)</Typography>
            <CssVarsProvider>
              <Textarea
                name='content'
                required
                minRows={5}
                sx={{ mt: 1 }}
                onInput={onInput}
                defaultValue='Lorem ipsum dolor sit amet consectetur!'
              />
            </CssVarsProvider>
          </InputLabel>
          {errors.content && (
            <FormHelperText sx={{ color: red[500] }}>
              {50 - errors.content} symbols left
            </FormHelperText>
          )}
        </Box>
        <Button type='submit' variant='contained' color='success'>
          Create Service
        </Button>
      </FormFieldsWrapper>
    )
  }