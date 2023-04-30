import { firestore } from '@/utils/firebase'
import { POSTS_DB_PATH } from '@/constants'
import type { FeedItem } from '@/@types'

const fetchFeed = async () => {
  const collection = firestore.collection(POSTS_DB_PATH)
  const collectionQuery = await collection.orderBy('timestamp', 'desc').get()

  const docs = collectionQuery.docs.map((doc) => {
    const data = doc.data() as FeedItem

    return {
      ...data,
      id: doc.id,
    }
  })

  return docs
}

export default fetchFeed
