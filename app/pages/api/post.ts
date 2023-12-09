import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import checkFields from '@/utils/checkFields'
import prisma from '@/utils/prisma'
import { Post } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const postsHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

// обробляємо POST-запит
// створення посту
postsHandler.post(async (req, res) => {
  // насправді `authorId` не міститься в тілі запиту
  // він зберігається у запиті
  const data: Pick<Post, 'title' | 'content' | 'authorId'> = JSON.parse(
    req.body
  )

  if (!checkFields(data, ['title', 'content'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  // доповнюємо дані полем `authorId`
  data.authorId = req.userId

  try {
    const post = await prisma.post.create({
      data
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Post create error' })
  }
})

// обробка PUT-запиту
// оновлення посту
postsHandler.put(async (req, res) => {
  const data: Pick<Post, 'title' | 'content'> & {
    postId: string
  } = JSON.parse(req.body)

  if (!checkFields(data, ['title', 'content'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const post = await prisma.post.update({
      // гарантія того, що користувач оновлює пост
      where: {
        id_authorId: { id: data.postId, authorId: req.userId }
      },
      data: {
        title: data.title,
        content: data.content
      }
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Update post error' })
  }
})

// обробка DELETE-запиту
// видалення посту
postsHandler.delete(async (req, res) => {
  const id = req.query.id as string

  if (!id) {
    return res.status(400).json({
      message: 'Post ID is missing'
    })
  }

  try {
    const post = await prisma.post.delete({
      // гарантія того, що користувач видаляє пост
      where: {
        id_authorId: {
          id,
          authorId: req.userId
        }
      }
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Post remove error' })
  }
})

export default authGuard(postsHandler)