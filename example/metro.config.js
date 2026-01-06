const path = require('path')
const escape = require('escape-string-regexp')
const { getDefaultConfig } = require('expo/metro-config')
const pak = require('../package.json')

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, '..')

const config = getDefaultConfig(projectRoot)

const peerDeps = Object.keys(pak.peerDependencies ?? {})

// block the hoisted copies from <repoRoot>/node_modules/<peerDep>
const peerDepBlockList = peerDeps.map(
  (name) => new RegExp(`^${escape(path.join(workspaceRoot, 'node_modules', name))}[\\\\/].*$`)
)

// Normalize Metro's default blockList to an array, then prepend ours
const defaultBlockList = config.resolver.blockList
  ? Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]
  : []

config.resolver.blockList = [...peerDepBlockList, ...defaultBlockList]

// Force peer deps to resolve from the example app's node_modules
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  ...Object.fromEntries(
    peerDeps.map((name) => [name, path.join(projectRoot, 'node_modules', name)])
  ),
}

config.watchFolders = [workspaceRoot]

module.exports = config
