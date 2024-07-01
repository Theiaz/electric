type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | JsonSerializable[]
  | { [key: string]: JsonSerializable }

interface Header {
  [key: string]: JsonSerializable
}

// Define the type for a record
export type Message = {
  key?: string
  value?: any
  headers?: Header
  offset?: number
}
