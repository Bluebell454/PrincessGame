const canvas = document.querySelector('canvas')
// Heart variables
let apiAnswer = null
let gamePaused = false
const c = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1

// canvas sizing
canvas.width = 1024 * dpr
canvas.height = 576 * dpr

canvas.style.width = '1024px'
canvas.style.height = '576px'
const zoom = 2

//adding sounds
const sounds = {
  jump: new Audio('./music/jump_sound.mp3'),
  gem: new Audio('./music/coin_sound.mp3'),
  win: new Audio('./music/gamewin_sound.mp3'),
  lose: new Audio('./music/gameover_sound.mp3'),
  bg: new Audio('./music/gamebg_sound.mp3'),
}
window.sounds = sounds

// background music settings
sounds.bg.loop = true
sounds.bg.volume = 0.3

// optional volume tuning
sounds.jump.volume = 0.5
sounds.gem.volume = 0.6
sounds.win.volume = 0.7
sounds.lose.volume = 0.7

const savedSoundVol = localStorage.getItem("soundVolume");

if (savedSoundVol !== null) {
    const vol = savedSoundVol / 100;
    sounds.jump.volume = vol;
    sounds.gem.volume = vol;
    sounds.win.volume = vol;
    sounds.lose.volume = vol;
    sounds.bg.volume = vol;
}


const layersData = {
   l_Sky_Ocean: l_Sky_Ocean,
   l_Sky_Two: l_Sky_Two,
   l_Ocean_3: l_Ocean_3,
   l_Back_Tiles: l_Back_Tiles,
   l_Front_Tiles: l_Front_Tiles,
   l_Decorations: l_Decorations,
   l_Front_Tiles_2: l_Front_Tiles_2,
   l_Collisions: l_Collisions,
};

window.addEventListener('click', startAudio, { once: true })
window.addEventListener('keydown', startAudio, { once: true })

function startAudio() {
  sounds.bg.currentTime = 0
  sounds.bg.play().catch(() => {})
}

const tilesets = {
  l_Sky_Ocean: { imageUrl: './images/13f2f685-b82d-49de-3500-ddeb8b993b00.png', tileSize: 16 },
  l_Sky_Two: { imageUrl: './images/dbd02534-69e0-47c2-de3c-d1f3a3e5a300.png', tileSize: 16 },
  l_Ocean_3: { imageUrl: './images/1317c1be-e893-4041-dc2c-9008803b1a00.png', tileSize: 16 },
  l_Back_Tiles: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Front_Tiles: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Decorations: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Front_Tiles_2: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Gems: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Collisions: { imageUrl: './images/decorations.png', tileSize: 16 },
};

// parallax backgrounds
const oceanLayerData = {
  l_Sky_Ocean: l_Sky_Ocean,
  l_Sky_Two: l_Sky_Two,
  l_Ocean_3: l_Ocean_3,
};

const brambleLayerData = {
  l_Back_Tiles: l_Back_Tiles,
  l_Front_Tiles: l_Front_Tiles,
  l_Decorations: l_Decorations,
  l_Front_Tiles_2: l_Front_Tiles_2,
};


// Tile setup
const collisionBlocks = []
const platforms = []
const blockSize = 16

// world sizing 

let WORLD_MAX_COLS = 0
let WORLD_ROWS = 0

Object.values(layersData).forEach(layer => {
  WORLD_ROWS = Math.max(WORLD_ROWS, layer.length)

  layer.forEach(row => {
    WORLD_MAX_COLS = Math.max(WORLD_MAX_COLS, row.length)
  })
})

const WORLD_WIDTH = WORLD_MAX_COLS * blockSize
const WORLD_HEIGHT = WORLD_ROWS * blockSize



collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

        context.drawImage(
          tilesetImage,
          srcX,
          srcY,
          tileSize,
          tileSize,
          x * 16,
          y * 16,
          16,
          16,
        )
      }
    })
  })
}

const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement('canvas')

 

  const tileSize = 16

// map dimensions 
offscreenCanvas.width = WORLD_WIDTH
offscreenCanvas.height = WORLD_HEIGHT



  const offscreenContext = offscreenCanvas.getContext('2d')

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  return offscreenCanvas
}

let player = new Player({
  x: 100,
  y: 100,
  size: 32,
  velocity: { x: 0, y: 0 },
})

let oposums = []
let eagles = []
let sprites = []
let hearts = [
  new Heart({
    x: 10,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
  new Heart({
    x: 33,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
  new Heart({
    x: 56,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
]

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

let lastTime = performance.now()
let camera = {
  x: 0,
  y: 0,
}

const SCROLL_POST_RIGHT = 330
const SCROLL_POST_TOP = 100
const SCROLL_POST_BOTTOM = 220
let oceanBackgroundCanvas = null
let brambleBackgroundCanvas = null
let gems = []
let gemUI = new Sprite({
  x: 13,
  y: 36,
  width: 15,
  height: 13,
  imageSrc: './images/gem.png',
  spriteCropbox: {
    x: 0,
    y: 0,
    width: 15,
    height: 13,
    frames: 5,
  },
})
let gemCount = 0
let elapsedSeconds = 0

function init() {
  gems = []
  gemCount = 0
  elapsedSeconds = 0
  gemUI = new Sprite({
    x: 13,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: './images/gem.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 15,
      height: 13,
      frames: 5,
    },
  })

  l_Gems.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 18) {
        gems.push(
          new Sprite({
            x: x * 16,
            y: y * 16,
            width: 15,
            height: 13,
            imageSrc: './images/gem.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 15,
              height: 13,
              frames: 5,
            },
            hitbox: {
              x: x * 16,
              y: y * 16,
              width: 15,
              height: 13,
            },
          }),
        )
      }
    })
  })

  player = new Player({
    x: 100,
    y: 100,
    size: 32,
    velocity: { x: 0, y: 0 },
  })
  // Eagles
  eagles = [
    new Eagle({
      x: 816,
      y: 172,
      width: 40,
      height: 41,
    }),
    new Eagle({
      x:1150,
      y: 170,
      width: 40,
      height: 41,
    }),
    new Eagle({
      x:1500,
      y: 170,
      width: 40,
      height: 41,
    }),
    new Eagle({
      x:1850,
      y: 150,
      width: 40,
      height: 41,
    }),
    new Eagle({
      x:2600,
      y: 150,
      width: 40,
      height: 41,
    }),
  ]

  // Oposums
  oposums = [
    new Oposum({
      x: 650,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 700,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 900,
      y: 500,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 990,
      y: 500,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1000,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1700,
      y: 100,
      width: 36,
      height: 28,
    }),
  ]

  sprites = []
  hearts = [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
  ]

  camera = {
    x: 0,
    y: 0,
  }
}

function animate(backgroundCanvas) {
  if (gamePaused) {
  requestAnimationFrame(() => animate(backgroundCanvas))
  return
}
  //  delta time
  const currentTime = performance.now()
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  
  elapsedSeconds += deltaTime

  // player position
  player.handleInput(keys)
  player.update(deltaTime, collisionBlocks)

  // oposum position
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.update(deltaTime, collisionBlocks)

    // enemy jump
    const collisionDirection = checkCollisions(player, oposum)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.isOnGround) {
         sounds.jump.currentTime = 0
         sounds.jump.play()
       
        player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        oposums.splice(i, 1)
      } else if (
        (collisionDirection === 'left' || collisionDirection === 'right') &&
        player.isOnGround &&
        player.isRolling
      ) {
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        oposums.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0 && !gamePaused) {
          sounds.bg.pause()
          sounds.lose.play()
  triggerHeartPuzzle()
}

        player.setIsInvincible()
      }
    }
  }

  //  eagle position
  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.update(deltaTime, collisionBlocks)

    // enemy jump
    const collisionDirection = checkCollisions(player, eagle)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.isOnGround) {
        sounds.jump.currentTime = 0
         sounds.jump.play()
      
        player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: eagle.x,
            y: eagle.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        eagles.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right' ||
        collisionDirection === 'top'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0 && !gamePaused) {
            sounds.bg.pause()
          sounds.lose.play()
  triggerHeartPuzzle()
}

        player.setIsInvincible()
      }
    }
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.update(deltaTime)

    if (sprite.iteration === 1) {
      sprites.splice(i, 1)
    }
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.update(deltaTime)

    // gem collection
    const collisionDirection = checkCollisions(player, gem)
    if (collisionDirection) {
      sounds.gem.currentTime = 0
      sounds.gem.play()
      sprites.push(
        new Sprite({
          x: gem.x - 8,
          y: gem.y - 8,
          width: 32,
          height: 32,
          imageSrc: './images/item-feedback.png',
          spriteCropbox: {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            frames: 5,
          },
        }),
      )

      // remove gem
      gems.splice(i, 1)
      gemCount++

      // End the game once the player has collected 55 gems
      if (gemCount >= 58 && !gamePaused) {
        endGameWithWin()
      }
    }
  }

if (player.y > WORLD_HEIGHT && !gamePaused) {
    // Deplete all hearts
    hearts.forEach(heart => heart.depleted = true)

    // Reset player position so they stop falling
    player.x = 100
    player.y = 100
    player.velocity.x = 0
    player.velocity.y = 0

    // ✅ Reset camera back to start so player is visible
    camera.x = 0
    camera.y = 0

    sounds.bg.pause()
    sounds.lose.play()
    triggerHeartPuzzle()
}
// scroll post distance
const viewportWidth = canvas.width / (dpr * zoom)
const maxCameraX = WORLD_WIDTH - viewportWidth


if (player.x > SCROLL_POST_RIGHT) {
  const scrollPostDistance = player.x - SCROLL_POST_RIGHT
  camera.x = scrollPostDistance
}

// camera positioning
if (camera.x < 0) camera.x = 0
if (camera.x > maxCameraX) camera.x = maxCameraX

  if (player.y < SCROLL_POST_TOP && camera.y > 0) {
    const scrollPostDistance = SCROLL_POST_TOP - player.y
    camera.y = scrollPostDistance
  }

  if (player.y > SCROLL_POST_BOTTOM) {
    const scrollPostDistance = player.y - SCROLL_POST_BOTTOM
    camera.y = -scrollPostDistance
  }

  // Render scene
c.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0)
c.clearRect(0, 0, canvas.width, canvas.height)
c.save()
c.translate(-camera.x, camera.y)
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0)
  c.drawImage(brambleBackgroundCanvas, camera.x * 0.16, 0)
  c.drawImage(backgroundCanvas, 0, 0)
  player.draw(c)

  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.draw(c)
  }

  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.draw(c)
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.draw(c)
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.draw(c)
  }

  
  c.restore()

  // UI save and restore
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.save()
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i]
    heart.draw(c)
  }

  gemUI.draw(c)
  // Gem count
  c.fillStyle = '#000'
  c.font = '16px "Trebuchet MS", system-ui, sans-serif'
  c.fillText(gemCount, 33, 46)

  // Showing time
  const timeLabel = `Time: ${elapsedSeconds.toFixed(1)}s`
  const paddingX = 8
  const paddingY = 4
  const baseX = 8
  const baseY = 54

  const textWidth = c.measureText(timeLabel).width
  const boxWidth = textWidth + paddingX * 2
  const boxHeight = 20

  // Background 
  c.fillStyle = 'rgba(255, 255, 255, 0.85)'
  c.fillRect(baseX, baseY, boxWidth, boxHeight)

  // Border
  c.strokeStyle = 'rgba(0, 0, 0, 0.6)'
  c.lineWidth = 1
  c.strokeRect(baseX, baseY, boxWidth, boxHeight)

  // Timer
  c.fillStyle = '#0b3a53'
  c.font = '14px "Trebuchet MS", system-ui, sans-serif'
  c.fillText(timeLabel, baseX + paddingX, baseY + boxHeight - paddingY - 2)
  c.restore()

  requestAnimationFrame(() => animate(backgroundCanvas))
}

//loading the canvas 
const startRendering = async () => {
  try {
    oceanBackgroundCanvas = await renderStaticLayers(oceanLayerData)
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData)
    const backgroundCanvas = await renderStaticLayers(layersData)
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate(backgroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}


async function endGameWithWin() {
  gamePaused = true
  sounds.bg.pause()
  sounds.win.play()

  const winScreen = document.getElementById('winScreen')
  if (winScreen) {
    winScreen.style.display = 'block'
    const finalTimeEl = document.getElementById('finalTime')
    if (finalTimeEl) {
      finalTimeEl.textContent = elapsedSeconds.toFixed(1)
    }
  }

  // ✅ SEND SCORE TO SERVER
  try {
    const res = await fetch("http://localhost:3000/save-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ score: elapsedSeconds })
    });

    const data = await res.json();

    // ✅ SHOW NEW RECORD MESSAGE
    if (data.newRecord) {
      showNewRecord();
    }

  } catch (err) {
    console.error("Error saving score:", err)
  }
}
function showNewRecord() {
  const recordEl = document.getElementById("newRecord");

  if (recordEl) {
    recordEl.style.display = "block";
  }
}

function restartGame() {
  const winScreen = document.getElementById('winScreen')
  if (winScreen) {
    winScreen.style.display = 'none'
  }
  const recordEl = document.getElementById("newRecord");
if (recordEl) {
  recordEl.style.display = "none";
}

  // reset overall game state
  init()
  gamePaused = false
  lastTime = performance.now()
  sounds.bg.currentTime = 0
  sounds.bg.play()
}
async function triggerHeartPuzzle() {

  try {

    gamePaused = true

    const response = await fetch(
      "https://marcconrad.com/uob/heart/api.php?out=json"
    )

    const data = await response.json()

    apiAnswer = data.solution

    showPuzzle(data.question)

  } catch (error) {

    console.error("Heart API error:", error)

  }

}

function showPuzzle(imageUrl) {

  const puzzleDiv = document.getElementById("heartPuzzle")
  const puzzleImage = document.getElementById("puzzleImage")

  puzzleImage.src = imageUrl
  puzzleDiv.style.display = "block"

}

function restoreHearts() {

  hearts.forEach((heart) => {
    heart.depleted = false
  })

  // reset player state
  player.isInvincible = true

  
  setTimeout(() => {
    player.isInvincible = false
  }, 1500)

}
function submitPuzzleAnswer() {

  const playerAnswer = document.getElementById("puzzleAnswer").value

  if (Number(playerAnswer) === Number(apiAnswer)) {

    console.log("Hearts restored")

    restoreHearts()

    // hide puzzle
    document.getElementById("heartPuzzle").style.display = "none"
    document.getElementById("puzzleAnswer").value = ""

    // resume game
    gamePaused = false
    lastTime = performance.now()

    // reset player movement
    player.velocity.x = 0
    player.velocity.y = 0

    sounds.bg.play()

  } else {

    alert("Wrong answer, try again.")


  }
}


window.submitPuzzleAnswer = submitPuzzleAnswer
window.restartGame = restartGame

// ================= PAUSE MENU =================
const pauseBtn = document.getElementById("pauseBtn")
const pauseMenu = document.getElementById("pauseMenu")
const resumeBtn = document.getElementById("resumeBtn")
const restartBtn = document.getElementById("restartBtn")
const menuBtn = document.getElementById("menuBtn")

function openPauseMenu() {
  gamePaused = true
  sounds.bg.pause()
  pauseMenu.style.display = "block"
  pauseBtn.textContent = "▶ Resume"
}

function closePauseMenu() {
  gamePaused = false
  lastTime = performance.now()
  sounds.bg.play()
  pauseMenu.style.display = "none"
  pauseBtn.textContent = "⏸ Pause"
}

pauseBtn.addEventListener("click", () => {
  if (gamePaused && pauseMenu.style.display === "block") {
    closePauseMenu()
  } else {
    openPauseMenu()
  }
})

resumeBtn.addEventListener("click", () => {
  closePauseMenu()
})

restartBtn.addEventListener("click", () => {
  pauseMenu.style.display = "none"
  pauseBtn.textContent = "⏸ Pause"
  restartGame()
})

menuBtn.addEventListener("click", () => {
  window.location.href = "menu.html"
})

init()
startRendering()
