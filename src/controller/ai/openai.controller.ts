import { getImages, saveImage } from "@/services/prisma/image"
import { generateImage, openaiCreateVariation } from "@/services/openai"
import { NextFunction, Request, Response } from "express"
import { pinFile } from "@/services/pinata"

class OpenAIController {
  public async generateTextToImage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { prompt, size, quality } = req.body
      const response = await generateImage(prompt, size, quality)
      if (!response.url) throw new Error("no url generated")

      const storedImg = await pinFile(response.url, req.user.id)
      if (!storedImg) throw new Error("Failed to pin image file")

      await saveImage(req.user.id, {
        url: storedImg,
        type: "generate",
        prompt: prompt,
        model: "dall-e-3",
        size: size,
        quality: quality,
      })

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  public async generateVariation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { size } = req.body

      const imgUrl = await openaiCreateVariation(req.file, size)

      const storedImg = await pinFile(imgUrl, req.user.id)
      if (!storedImg) throw new Error("Failed to pin image file")

      await saveImage(req.user.id, {
        url: storedImg,
        type: "variation",
        prompt: "",
        model: "dall-e-3",
        size: size,
        quality: "standard",
      })

      res.status(200).json(storedImg)
    } catch (error) {
      next(error)
    }
  }

  public async getAllImages(req: Request, res: Response, next: NextFunction) {
    try {
      const images = await getImages()
      res.status(200).json(images)
    } catch (error) {
      next(error)
    }
  }
}

export default OpenAIController
