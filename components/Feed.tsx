import { useEffect, useState } from 'react'
import { firestore } from '@/utils/firebase'
import { DB_PATH } from '@/constants'
import type { FeedItem } from '@/@types'

const fetchFeed = async () => {
  const collection = firestore.collection(DB_PATH)
  const collectionQuery = await collection.get()

  const docs = collectionQuery.docs.map((doc) => {
    const data = doc.data() as FeedItem

    return {
      ...data,
      id: doc.id,
    }
  })

  return docs
}

const Feed = () => {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchFeed()
      .then((payload) => setFeed(payload))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {loading
        ? 'Loading...'
        : !feed.length
        ? 'Nothing...'
        : feed.map((item) => <div key={`post-${item.id}`}>{item.id}</div>)}
    </div>
  )
}

export default Feed
