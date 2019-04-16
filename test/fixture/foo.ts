import {version, dependencies, description, license as LICENSE} from '../../package.json'
import {test} from './foo.bar'
import '../../package.json'
export function foo () {
    return [version, dependencies, description, LICENSE]
}
export function getTest () {
    return test
}
export type foo = typeof test