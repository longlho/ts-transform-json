import {version, dependencies, description} from '../../package.json'
import {test} from './foo.bar'
export function foo () {
    return [version, dependencies, description]
}
export function getTest () {
    return test
}