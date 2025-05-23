'use strict'

/**
 * Joins several string chunks with the first argument the function is called with.
 * This is basically the reverse of the String split function, with the difference that we make sure
 * the merging character is not duplicated
 * @param {string} sep separator we want to merge the string chunks with
 * @param {...string} args string chunks to be joined
 * @return {string}
 */
const mergeStrings = (sep, ...args) => {
  const argNb = args.length
  if (argNb == 0 || args[0] === undefined || args[0] === null) return ''
  let accumulatedStr = `${args[0]}`
  for (let i = 1; i < argNb; i++) {
    if (args[i] === undefined || args[i] === null) break
    const newChunk = `${args[i]}`
    const cleanChunk = newChunk.startsWith(sep) ? newChunk.slice(1) : newChunk
    accumulatedStr = accumulatedStr.endsWith(sep) ? accumulatedStr + cleanChunk : accumulatedStr + sep + cleanChunk
  }
  return accumulatedStr
}
export const pathJoin = (...args) => mergeStrings('/', ...args)

export const lastElementOfArray = (anArray) => anArray.slice(-1)[0]

/**
 * Get the extension of a file name
 */
export const getFileExtension = (fileName) => lastElementOfArray(`${fileName}`.split('.'))

/**
 * Split an input string with an array of single characters
 * @param {*} strInput the input string
 * @param {*} delimiters an array of single characters
 * @returns the splitted string
 */
export const multiSplit = (inputStr, singleCharDelimiterArray, shouldTrim) => {
  if (!inputStr) return []
  if (!Array.isArray(singleCharDelimiterArray) && singleCharDelimiterArray.length > 0)
    throw new Error('Wrong use, second parameter should be an array')

  // Converts input delimiters array elements into string
  const delimiters = []
  singleCharDelimiterArray.map((c) => {
    if (`${c}`.length !== 1)
      throw new Error('Wrong use, second parameter should be an array of single character strings')
    delimiters.push(`${c}`)
  })

  // Examine input string, one character at a time
  const result = []
  let chunk = ''
  for (const inputChar of inputStr) {
    let isDelimiter = false
    // Check if the current input character is a delimiter
    for (const delimiter of delimiters) {
      if (inputChar === delimiter) {
        // Current input character is a delimiter
        if (shouldTrim) chunk = chunk.trim()
        if (chunk.length > 0) result.push(chunk)
        chunk = ''
        isDelimiter = true
        break
      }
    }
    if (!isDelimiter) chunk += inputChar
  }
  if (shouldTrim) chunk = chunk.trim()
  if (chunk.length > 0) result.push(chunk)
  return result
}

/**
 *
 * @param {String} name Name of the cookie we want to access.
 *  Only non-httpOnly cookies are accessible by definition
 * @returns the value of the cookie
 */
export const getCookie = (name = 'consoleToken') => {
  const cookieDecoded = decodeURIComponent(document.cookie)
  const cookieArray = cookieDecoded.split('; ')
  let foundCookie
  for (const cookie of cookieArray) {
    if (cookie.startsWith(`${name}=`)) {
      foundCookie = cookie.substring(name.length + 1)
      break
    }
  }
  if (!foundCookie) {
    console.error(`Cookie not found: ${name}`)
    throw new Error('Cookie not found')
  }
  if (!checkCookieExp(foundCookie)) {
    console.error(`Cookie not valid: ${name}`)
    throw new Error('Cookie not valid')
  }
  return foundCookie
}

/**
 *
 * @param {*} cookieStr
 * @returns
 */
export const checkCookieExp = (cookieStr) => {
  if (!cookieStr) return false
  try {
    const payloadB64url = cookieStr.split('.')[1]
    const payload = JSON.parse(decodeBase64url(payloadB64url))
    const exp = payload.exp
    return nowEpochS() < exp
  } catch (e) {
    console.error('[checkCookieExp]', e)
    return false
  }
}

export const nowEpochS = () => Math.floor(new Date().getTime() / 1000)

export const dateISO = (date) => new Date(date).toISOString()

const pad = (number, length = 2) => String(number).padStart(length, '0')

export function toLocalIsoStrWithoutOffset(dateInput = new Date()) {
  const date = new Date(dateInput) // parse if needed

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // months are 0-indexed
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())
  const ms = pad(date.getMilliseconds(), 3)
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`
}

export function toLocalIsoStrWithOffset(dateInput = new Date()) {
  const date = new Date(dateInput) // parse if needed
  const offsetMinutes = date.getTimezoneOffset()
  const offsetSign = offsetMinutes > 0 ? '-' : '+'
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60))
  const offsetMins = pad(Math.abs(offsetMinutes) % 60)
  return `${toLocalIsoStrWithoutOffset(dateInput)}${offsetSign}${offsetHours}${offsetMins}`
}

export function fromLocalIsoWithoutOffsetToUtcDate(localDate) {}

export const padEndModulo = (str, base, padSign = '=') => {
  const modulo = str.length % base
  return modulo === 0 ? str : str.padEnd(str.length + base - modulo, padSign?.substring(0, 1))
}
export const padWithEqualSignBase4 = (str) => padEndModulo(str, 4)

export const base64urlToBase64 = (b64urlStr) => b64urlStr.replace(/\+/g, '-').replace(/\//g, '_')

export const decodeBase64url = (b64urlStr) => {
  const paddedB64Str = base64urlToBase64(b64urlStr)
  return decodeURIComponent(atob(paddedB64Str))
}

/**
 * crypto.randomUUIDis is accessible only for HTTPS or localhost
 * https://stackoverflow.com/a/2117523/1563072
 * @returns
 */
export const uuidv4 = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
      )

export const getPageInfo = (field) => {
  const url = window.location.pathname
  const lastSlashIndex = url.lastIndexOf('/')
  const path = url.slice(0, lastSlashIndex)
  const name = url.slice(lastSlashIndex + 1)
  const docInfo = { url, path, name }
  // console.log('docInfo:', JSON.stringify(docInfo))
  return field ? docInfo[field] : docInfo
}

export const fetchConf = () =>
  fetch(pathJoin(getPageInfo('path'), 'conf'))
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching config:', error))

export const beautify = (obj) => {
  const seen = []
  return JSON.stringify(
    obj,
    (key, val) => {
      if (val != null && typeof val == 'object') {
        if (seen.indexOf(val) >= 0) return
        seen.push(val)
      }
      return val
    },
    2
  )
}
