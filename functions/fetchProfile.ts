import { firestore } from '@/utils/firebase'
import { PROFILES_DB_PATH } from '@/constants'
import type { Profile } from '@/@types'

const fetchProfile = async (stakeKey: string) => {
  const collection = firestore.collection(PROFILES_DB_PATH)
  const collectionQuery = await collection.where('stakeKey', '==', stakeKey).get()

  const docs = collectionQuery.docs.map((doc) => {
    const data = doc.data() as Profile

    return {
      ...data,
      id: doc.id,
    }
  })

  if (!docs.length) {
    return null
  }

  return docs[0]
}

export default fetchProfile
