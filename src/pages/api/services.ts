import { NextApiRequestWithUserId } from 'src/types'
import authGuard from 'src/utils/authGuard'
import checkFields from 'src/utils/checkFields'
import prisma from 'src/utils/prisma'
import { Services } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const servicesHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

servicesHandler.post(async (req, res) => {
    const data: Pick<Services, 'title' | 'type' | 'price' | 'content' | 'latitude' | 'longitude' | 'authorId'> = JSON.parse(
      req.body
    )
  
    if (!checkFields(data, ['title', 'type', 'price', 'content', 'latitude', 'longitude'])) {
      res.status(400).json({ message: 'Some required fields are missing' })
    }
  
    data.authorId = req.userId
  
    try {
      const services = await prisma.services.create({
        data
      })
      res.status(200).json(services)
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Service create error' })
    }
})

servicesHandler.put(async (req, res) => {
  const data: Pick<Services, 'title' | 'type' | 'price' | 'content' | 'latitude' | 'longitude'> & {
    servicesId: string
  } = JSON.parse(req.body)

  if (!checkFields(data, ['title', 'type', 'price', 'content', 'latitude', 'longitude'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const services = await prisma.services.update({
      where: {
        id_authorId: { id: data.servicesId, authorId: req.userId }
      },
      data: {
        title: data.title,
        type: data.type,
        price: data.price,
        content: data.content,
        latitude: data.latitude,
        longitude: data.longitude
      }
    })
    res.status(200).json(services)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Update service error' })
  }
})

servicesHandler.delete(async (req, res) => {
  const id = req.query.id as string

  if (!id) {
    return res.status(400).json({
      message: 'Services ID is missing'
    })
  }

  try {
    const services = await prisma.services.delete({
      where: {
        id_authorId: {
          id,
          authorId: req.userId
        }
      }
    })
    res.status(200).json(services)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Service remove error' })
  }
})

export default authGuard(servicesHandler)