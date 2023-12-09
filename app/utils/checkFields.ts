// Finally, we define a utility to check the presence of required fields in the request body:

export default function checkFields<T>(obj: T, keys: Array<keyof T>) {
  for (const key of keys) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}