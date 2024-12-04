import { PinataSDK, UploadOptions } from "pinata-web3"
import { generateRandomString } from "@/utils"

const pinataJwt = process.env.PINATA_JWT
const pinataGateway = process.env.PINATA_GATEWAY
const pinataGroupId = process.env.PINATA_GROUP_ID

const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway,
})

const DEFAULT_EXTENSION = "jpg"
const IMAGE_PATH = "generatedImages"

export const pinFile = async (
  url: string,
  userId: string
): Promise<string | undefined> => {
  try {
    const response = await fetch(url)
    if (!response.ok)
      throw new Error(`Failed to fetch file: ${response.statusText}`)

    const contentType = response.headers.get("Content-Type")
    if (!contentType) throw new Error("No content type found")

    const fileExtension = contentType.split("/")[1] || DEFAULT_EXTENSION
    const fileName = `${userId}/${generateRandomString(10)}.${fileExtension}`
    const fileNameWithPath = `${IMAGE_PATH}/${fileName}`

    const options: UploadOptions = {
      metadata: { name: fileNameWithPath },
      groupId: pinataGroupId,
    }
      
    const result = await pinata.upload.url(url, options)
    return `${pinataGateway}/ipfs/${result.IpfsHash}/${fileName}`
  } catch (error) {
    console.error("Error pinning file to IPFS:", error)
    return undefined
  }
}
