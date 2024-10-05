const express = require('express');
const router = express.Router();
const fs = require('node:fs/promises');

router.post('/', async function (req, res, next) {
  try {
    const { user_id } = req.body
    if (!user_id) {
      throw new Error("Invalid user id")
    }
    const content = `${user_id} task completed at- ${Date.now()}\n`
    await fs.appendFile('userRequestLogs.txt', content)
    setTimeout(() => {
      res.send(`User with id - ${user_id} received`);
    }, 1000)
  } catch (err) {
    setTimeout(() => {
      res.status(err.status || 500)
        .json({ message: err.message || "Something went wrong!!" })
    }, 1000)
  }
});

module.exports = router;
