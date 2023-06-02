import { Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { PostsService } from '../services/posts.service'
import { CreatePostDto } from '../dtos/posts/request/create-post.dto'
import { Authenticated } from '../utils/types'

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.user as Authenticated
  const dto = plainToInstance(CreatePostDto, { ...req.body })
  await dto.isValid()

  const result = await PostsService.create(dto, user.id)

  res.status(201).json(result)
}
