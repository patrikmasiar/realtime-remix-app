import {useEffect, useRef} from "react";
import {useAppContext} from "~/context";

const Playground = () => {
  const { user } = useAppContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 400

    let x = 100
    let y = 100
    const step = 10

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const image = new Image()
      image.src = `${user?.avatar}&size=50&radius=50` || ''
      image.onload = () => {
        ctx.drawImage(image, x, y, 50, 50)
      }
    }

    draw()

    const move = (direction: string) => {
      switch (direction) {
        case 'ArrowUp':
          y -= step
          break
        case 'ArrowDown':
          y += step
          break
        case 'ArrowLeft':
          x -= step
          break
        case 'ArrowRight':
          x += step
          break
      }
      draw()
    }

    document.addEventListener('keydown', (event) => {
      move(event.key)
    })

    return () => {
      document.removeEventListener('keydown', (event) => {
        move(event.key)
      })
    }


  }, [user?.avatar]);

  return <canvas ref={canvasRef} />
}

export default Playground