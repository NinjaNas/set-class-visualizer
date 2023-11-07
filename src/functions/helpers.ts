export const formatSetToString = (
  s: string,
  format: string = 'prime',
  removeInversion: boolean = true
): string => {
  switch (format) {
    case 'prime':
      return '{' + s.split('|')[0].slice(1, -1).replace(/"/g, '') + '}'
    case 'forte':
      if (
        removeInversion &&
        s.split('|')[1].endsWith('A') &&
        localStorage.getItem('dag')?.includes('original')
      ) {
        return s.split('|')[1].slice(0, -1)
      }
      return s.split('|')[1]
    case 'vec':
      return s.split('|')[2]
  }
  return ''
}

export const toMidiNote = (s: string, octave: number): string => {
  const val = parseInt(s) + 12 * octave
  return val > 127 ? (val - 12).toString() : val < 0 ? (val + 12).toString() : val.toString()
}

export const toFormattedPrimeFormArray = (s: string): string[] => {
  return JSON.parse(s.split('|')[0].replace(/T/, '10').replace(/E/, '11'))
}

export const isBlackKey = (n: number): boolean => {
  return [1, 3, 6, 8, 10].includes(n % 12)
}

export const transpose = (n: string, t: number): string => {
  if (!n) {
    return ''
  }
  return ((parseInt(n.replace(/T/, '10').replace(/E/, '11')) + t) % 12).toString()
}
