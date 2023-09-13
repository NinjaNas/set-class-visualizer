export const formatSetToString = (s: string): string => {
  return '{' + s.slice(1, -1).replace(/"/g, '') + '}'
}

export const toMidiNote = (s: string): string => {
  return (parseInt(s) + 60).toString()
}

export const toFormattedPrimeFormArray = (s: string): string[] => {
  return JSON.parse(s.replace(/T/, '10').replace(/E/, '11'))
}

export const isBlackKey = (n: number): boolean => {
  return [1, 3, 6, 8, 10].includes(n % 12)
}
