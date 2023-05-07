export type StakeKey = string
export type MediaType = 'music' | 'image' | 'video' | '360 video'

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

export interface Comment {
  timestamp: number
  stakeKey: StakeKey
  text: string
}

export interface FeedItem {
  id: string
  timestamp: number
  stakeKey: StakeKey
  text: string
  media: {
    type: MediaType
    url: string
  }
  likes: StakeKey[]
  comments: Comment[]
}

export interface ExtendedComment extends Comment {
  uname?: string
  pfp?: string
}

export interface ExtendedFeedItem extends FeedItem {
  pfp?: string
  comments: ExtendedComment[]
}
