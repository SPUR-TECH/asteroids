const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const restartGameBtn = document.querySelector('#restartGameBtn')
const removeModel = document.querySelector('#model')
const removeStartModel = document.querySelector('#startModel')
const finalScore = document.querySelector('#finalScore')
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()

        const friction = 0.95

        this.velocity.x *= friction
        this.velocity.y *= friction

        if (this.x + this.radius + this.velocity.x <= canvas.width &&
            this.x - this.radius + this.velocity.x >= 0) {
            this.x += this.velocity.x
        } else {
            this.velocity.x = 0
        }

        if (this.y + this.radius + this.velocity.y <= canvas.height &&
            this.y - this.radius + this.velocity.y >= 0) {
            this.y += this.velocity.y
        } else {
            this.velocity.y = 0
        }
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.type = 'Linier'
        this.radians = 0
        this.center = {
            x,
            y
        }

        if (Math.random() > 0.5) {
            this.type = 'Homing'

            if (Math.random() > 0.5) {
                this.type = 'Spinning'
            }

            if (Math.random() > 0.5) {
                this.type = 'Homing Spinning'
            }
        }
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()

        if (this.type === 'Spinning') {
            this.radians += 0.1

            this.center.x += this.velocity.x
            this.center.y += this.velocity.y

            this.x = this.center.x + Math.cos(this.radians) * 30
            this.y = this.center.y + Math.sin(this.radians) * 30

        } else if (this.type === 'Homing') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x)
            this.velocity.x = Math.cos(angle)
            this.velocity.y = Math.sin(angle)

            this.x = this.x + this.velocity.x
            this.y = this.y + this.velocity.y
        } else if (this.type === 'Homing Spinning') {
            this.radians += 0.1

            const angle = Math.atan2(player.y - this.center.y, player.x - this.center.x)
            this.velocity.x = Math.cos(angle)
            this.velocity.y = Math.sin(angle)

            this.center.x += this.velocity.x
            this.center.y += this.velocity.y

            this.x = this.center.x + Math.cos(this.radians) * 30
            this.y = this.center.y + Math.sin(this.radians) * 30

        } else {
            this.x = this.x + this.velocity.x
            this.y = this.y + this.velocity.y
        }
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(
    x,
    y,
    10,
    'white')

let projectiles = []
let enemies = []
let particles = []
let animationId
let intervalId
let score = 0

function init() {
    player = new Player(
        x,
        y,
        10,
        'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    finalScore.innerHTML = score
}

function spawnEnemies() {
    intervalId = setInterval(() => {
            const radius = Math.random() * (50 - 8) + 8

            let x
            let y

            if (Math.random() > 0.5) {
                x = Math.random() > .5 ? 0 - radius : canvas.width + radius
                y = Math.random() * canvas.height

            } else {
                x = Math.random() * canvas.width
                y = Math.random() > .5 ? 0 - radius : canvas.height + radius
            }

            const color = `hsl(${Math.random() * 360}, 50%, 50%)`

            const angle = Math.atan2(
                canvas.height / 2 - y,
                canvas.width / 2 - x
            )
            const velocity = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            }

            enemies.push(new Enemy(x, y, radius, color, velocity))
        },
        2000)
}

function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, .1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if (dist - enemy.radius - player.radius < 1) {

            cancelAnimationFrame(animationId)
            clearInterval(intervalId)
            removeModel.style.display = 'block'
            finalScore.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            if (dist - enemy.radius - projectile.radius < 1) {

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5 * (Math.random() * 6)),
                        y: (Math.random() - 0.5 * (Math.random() * 6))
                    }))
                }

                if (enemy.radius - 10 > 7) {

                    score += 100
                    scoreEl.innerHTML = score

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    event.preventDefault()
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(
        new Projectile(player.x, player.y,
            5,
            'yellow', velocity)
    )
})

addEventListener('touch', (event) => {
    event.preventDefault()
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(
        new Projectile(player.x, player.y,
            5,
            'yellow', velocity)
    )
})
restartGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    removeModel.style.display = 'none'
})
startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    // removeStartModel.style.display = 'none'
    gsap.to('#startModel', {
        opacity: 0,
        scale: 0,
        duration: 0.65,
        rotate: 720,
        ease: 'expo.in',
        onComplete: () => {
            startModel.style.display = 'none'
        }
    })
})

addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowRight':
            player.velocity.x += 1
            break

        case 'ArrowLeft':
            player.velocity.x -= 1
            break

        case 'ArrowUp':
            player.velocity.y -= 1
            break

        case 'ArrowDown':
            player.velocity.y += 1
            break
    }
})