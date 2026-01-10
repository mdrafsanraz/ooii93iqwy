import { MongoClient, Db, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI || ''

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error('MONGODB_URI environment variable is not set'))
  }

  // MongoDB connection options with Server API for Atlas
  const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options)
      clientPromise = client.connect()
    }
    return clientPromise
  }
}

export default getClientPromise

export async function getDatabase(): Promise<Db> {
  try {
    const clientPromise = getClientPromise()
    const client = await clientPromise
    return client.db('rdistro')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}
