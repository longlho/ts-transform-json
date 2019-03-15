import * as packageJson from '../../package.json'

export function getAll () {
    return packageJson
}

export type Package = typeof packageJson