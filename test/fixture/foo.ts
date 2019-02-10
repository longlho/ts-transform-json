import {version, dependencies, description} from '../../package.json'
import * as packageJson from '../../package.json'
export function foo () {
    return [version, dependencies, description]
}

export function getAll () {
    return packageJson
}