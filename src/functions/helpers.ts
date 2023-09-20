export const formatSetToString = (s: string): string => {
  return '{' + s.slice(1, -1).replace(/"/g, '') + '}'
}

export const toMidiNote = (s: string, octave: number): string => {
  const val = parseInt(s) + 12 * octave
  return val > 127 ? (val - 12).toString() : val < 0 ? (val + 12).toString() : val.toString()
}

export const toFormattedPrimeFormArray = (s: string): string[] => {
  return JSON.parse(s.replace(/T/, '10').replace(/E/, '11'))
}

export const isBlackKey = (n: number): boolean => {
  return [1, 3, 6, 8, 10].includes(n % 12)
}

export const transpose = (n: string, t: number): string => {
  return ((parseInt(n) + t) % 12).toString()
}
