const fs = require('fs')

module.exports = {
  async unlinkDir (dir) {
    try {
      await fs.promises.unlink(dir)
      return true
    } catch (error) {
      return false
    }
  },
  async ensureDirectory (dir) {
    try {
      await fs.promises.mkdir(dir)
      return true
    } catch (error) {
      return false
    }
  },
}
