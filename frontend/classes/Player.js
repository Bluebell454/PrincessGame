const X_VELOCITY = 200
const JUMP_POWER = 320
const GRAVITY = 580

class Player {
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.velocity = velocity
    

    this.isJumping = false
    this.isOnGround = false

    this.isImageLoaded = false

    this.image = new Image()
    this.image.onload = () => {
      this.isImageLoaded = true
    }
    this.image.src = './images/player.png'

    this.elapsedTime = 0
    this.currentFrame = 0

    this.sprites = {
      idle: {
        x: 0,
        y: 0,
        width: 33,
        height: 32,
        frames: 4,
      },
      run: {
        x: 0,
        y: 32,
        width: 33,
        height: 32,
        frames: 6,
      },
      jump: {
        x: 0,
        y: 32 * 5,
        width: 33,
        height: 32,
        frames: 1,
      },
      fall: {
        x: 33,
        y: 32 * 5,
        width: 33,
        height: 32,
        frames: 1,
      },
      roll: {
        x: 0,
        y: 32 * 9,
        width: 33,
        height: 32,
        frames: 4,
      },
    }

    this.currentSprite = this.sprites.roll
    this.facing = 'right'

    this.hitbox = {
      x: 0,
      y: 0,
      width: 20,
      height: 23,
    }

    this.isInvincible = false
    this.isRolling = false
    this.isInAirAfterRolling = false
  }

  setIsInvincible() {
    this.isInvincible = true
    setTimeout(() => {
      this.isInvincible = false
    }, 1500)
  }

  draw(c) {
    if (this.isImageLoaded === true) {
      let xScale = 1
      let x = this.x

      if (this.facing === 'left') {
        xScale = -1
        x = -this.x - this.width
      }

      c.save()
      c.globalAlpha = this.isInvincible ? 0.5 : 1

      c.scale(xScale, 1)
      c.drawImage(
        this.image,
        this.currentSprite.x + this.currentSprite.width * this.currentFrame,
        this.currentSprite.y,
        this.currentSprite.width,
        this.currentSprite.height,
        x,
        this.y,
        this.width,
        this.height
      )
      
      c.restore()
    }
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    // animation
    this.elapsedTime += deltaTime
    const secondsInterval = 0.1
    if (this.elapsedTime > secondsInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames
      this.elapsedTime -= secondsInterval
    }

    if (this.isRolling && this.currentFrame === 3) {
      this.isRolling = false
    }

    // hitbox
    this.hitbox.x = this.x + 4
    this.hitbox.y = this.y + 9

    // gravity (UPDATED)
    this.applyGravity(deltaTime)

    // movement + collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    this.checkPlatformCollisions(platforms, deltaTime)

    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)

    this.determineDirection()
    this.switchSprites()
  }

  jump() {
  if (!this.isOnGround) return

  this.velocity.y = -JUMP_POWER
  this.isOnGround = false
  this.isJumping = true

  // 🔊 ADD THIS
  window.sounds.jump.currentTime = 0
  window.sounds.jump.play()
}
  roll() {
    if (this.isOnGround) {
      this.currentSprite = this.sprites.roll
      this.currentFrame = 0
      this.isRolling = true
      this.isInAirAfterRolling = true
      this.velocity.x = this.facing === 'right' ? 300 : -300
    }
  }

  determineDirection() {
    if (this.velocity.x > 0) this.facing = 'right'
    else if (this.velocity.x < 0) this.facing = 'left'
  }

  switchSprites() {
    if (this.isRolling) return

    if (this.isOnGround && this.velocity.x === 0 && this.currentSprite !== this.sprites.idle) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.idle
    } else if (this.isOnGround && this.velocity.x !== 0 && this.currentSprite !== this.sprites.run) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.run
    } else if (!this.isOnGround && this.velocity.y < 0 && this.currentSprite !== this.sprites.jump) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.jump
    } else if (!this.isOnGround && this.velocity.y > 0 && this.currentSprite !== this.sprites.fall) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.fall
    }
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
    this.hitbox.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
    this.hitbox.y += this.velocity.y * deltaTime
  }

  // ✅ UPDATED GRAVITY (variable jump)
  applyGravity(deltaTime) {
    if (!this.isJumping && this.velocity.y < 0) {
      this.velocity.y += GRAVITY * 2 * deltaTime
    } else {
      this.velocity.y += GRAVITY * deltaTime
    }
  }

  handleInput(keys) {
    if (this.isRolling || this.isInAirAfterRolling) return

    this.velocity.x = 0

    if (keys.d.pressed) this.velocity.x = X_VELOCITY
    else if (keys.a.pressed) this.velocity.x = -X_VELOCITY
  }

  stopRoll() {
    this.velocity.x = 0
    this.isRolling = false
    this.isInAirAfterRolling = false
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001

    for (let i = 0; i < collisionBlocks.length; i++) {
      const block = collisionBlocks[i]

      if (
        this.hitbox.x <= block.x + block.width &&
        this.hitbox.x + this.hitbox.width >= block.x &&
        this.hitbox.y + this.hitbox.height >= block.y &&
        this.hitbox.y <= block.y + block.height
      ) {
        if (this.velocity.x < 0) {
          this.hitbox.x = block.x + block.width + buffer
          this.x = this.hitbox.x - 4
          this.stopRoll()
          break
        }

        if (this.velocity.x > 0) {
          this.hitbox.x = block.x - this.hitbox.width - buffer
          this.x = this.hitbox.x - 4
          this.stopRoll()
          break
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001

    for (let i = 0; i < collisionBlocks.length; i++) {
      const block = collisionBlocks[i]

      if (
        this.hitbox.x <= block.x + block.width &&
        this.hitbox.x + this.hitbox.width >= block.x &&
        this.hitbox.y + this.hitbox.height >= block.y &&
        this.hitbox.y <= block.y + block.height
      ) {
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.hitbox.y = block.y + block.height + buffer
          this.y = this.hitbox.y - 9
          break
        }

        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = block.y - this.height - buffer
          this.hitbox.y = block.y - this.hitbox.height - buffer
          this.isOnGround = true
          this.isJumping = false // ✅ IMPORTANT RESET

          if (!this.isRolling) this.isInAirAfterRolling = false
          break
        }
      }
    }
  }

  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001

    for (let platform of platforms) {
      if (platform.checkCollision(this, deltaTime)) {
        this.velocity.y = 0
        this.y = platform.y - this.height - buffer
        this.isOnGround = true
        this.isJumping = false // ✅ IMPORTANT RESET
        return
      }
    }

    this.isOnGround = false
  }
}