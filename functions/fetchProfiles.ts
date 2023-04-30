import { firestore } from '@/utils/firebase'
import { PROFILES_DB_PATH } from '@/constants'
import type { Profile } from '@/@types'

const fetchProfiles = async () => {
  const collection = firestore.collection(PROFILES_DB_PATH)
  const collectionQuery = await collection.get()

  const docs = collectionQuery.docs.map((doc) => {
    const data = doc.data() as Profile

    return {
      ...data,
      id: doc.id,
    }
  })

  return docs
}

export default fetchProfiles
