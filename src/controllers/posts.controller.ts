import { Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { PostsService } from '../services/posts.service'
import { CreatePostDto } from '../dtos/posts/request/create-post.dto'
import { Authenticated } from '../utils/types'
import { UpdatePostDto } from '../dtos/posts/request/update-post.dto'

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.user as Authenticated
  const dto = plainToInstance(CreatePostDto, { ...req.body })
  await dto.isValid()

  const result = await PostsService.create(dto, user.id)

  res.status(201).json(result)
}

export async function find(req: Request, res: Response): Promise<void> {
  const result = await PostsService.find(parseInt(req.params.postId))

  res.status(200).json(result)
}

export async function update(req: Request, res: Response): Promise<void> {
  const user = req.user as Authenticated
  const data = plainToInstance(UpdatePostDto, req.body)
  await data.isValid()

  const result = await PostsService.update(
    data,
    parseInt(req.params.postId),
    user.id,
  )

  res.status(200).json(result)
}
