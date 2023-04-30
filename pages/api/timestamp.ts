import { NextApiRequest, NextApiResponse } from 'next'

export interface TimestampResponse {
  timestamp: number
}

const handler = async (req: NextApiRequest, res: NextApiResponse<TimestampResponse>) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const timestamp = Date.now()

        return res.status(200).json({
          timestamp,
        })
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
