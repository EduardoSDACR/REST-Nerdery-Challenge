import { Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { Authenticated } from '../utils/types'
import { CreateCommentDto } from '../dtos/comments/request/create-comment.dto'
import { CommentsService } from '../services/comments.service'
import { UpdateCommentDto } from '../dtos/comments/request/update-comment.dto'

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.user as Authenticated
  const dto = plainToInstance(CreateCommentDto, { ...req.body })
  await dto.isValid()

  const result = await CommentsService.create(dto, user.id)

  res.status(201).json(result)
}

export async function find(req: Request, res: Response): Promise<void> {
  const result = await CommentsService.find(parseInt(req.params.commentId))

  res.status(200).json(result)
}

export async function update(req: Request, res: Response): Promise<void> {
  const user = req.user as Authenticated
  const dto = plainToInstance(UpdateCommentDto, req.body)
  await dto.isValid()

  const result = await CommentsService.update(
    dto,
    parseInt(req.params.commentId),
    user.id,
  )

  res.status(200).json(result)
}

export async function deleteComment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user as Authenticated
  await CommentsService.delete(parseInt(req.params.commentId), user.id)

  res.status(204).send()
}
