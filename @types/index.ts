export type StakeKey = string

export interface PopulatedWallet {
  stakeKey: StakeKey
  policyIds: string[]
  tokenIds: string[]
  is4042: boolean
  isHolder: boolean
}

export interface Profile {
  id: string
  stakeKey: StakeKey
  uname?: string
  pfp?: string
}

export interface FeedItem {
  id: string
  text: string
  media: {
    type: string
    urk: string
  }
  likes: StakeKey[]
  comments: {
    stakeKey: StakeKey
    text: string
  }[]
}
